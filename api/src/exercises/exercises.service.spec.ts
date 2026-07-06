import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import { Repository } from "typeorm";
import { ExercisesService } from "./exercises.service";
import { Exercise, MuscleGroup, TrackingType } from "./entities/exercise.entity";

type MockRepo = Partial<Record<keyof Repository<Exercise>, jest.Mock>>;

const createMockRepo = (): MockRepo => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe("ExercisesService", () => {
  let service: ExercisesService;
  let repo: MockRepo;

  const globalExercise: Exercise = {
    id: "ex-global",
    created_by: null,
    creator: null,
    slug: "push_up",
    muscle_group: MuscleGroup.CHEST,
    is_global: true,
    tracking_type: TrackingType.STRENGTH,
    notes: null,
    created_at: new Date(),
  };

  const ownedExercise: Exercise = {
    ...globalExercise,
    id: "ex-owned",
    created_by: "user-1",
    is_global: false,
  };

  beforeEach(async () => {
    repo = createMockRepo();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExercisesService,
        { provide: getRepositoryToken(Exercise), useValue: repo },
      ],
    }).compile();

    service = module.get(ExercisesService);
  });

  describe("findAll", () => {
    it("filters to global + own exercises for non-admin", async () => {
      repo.find!.mockResolvedValue([globalExercise, ownedExercise]);

      const result = await service.findAll("user-1", undefined, false);

      expect(repo.find).toHaveBeenCalledWith({
        where: [
          { is_global: true },
          { created_by: "user-1" },
        ],
      });
      expect(result).toEqual([globalExercise, ownedExercise]);
    });

    it("returns all exercises unfiltered by ownership for admin", async () => {
      repo.find!.mockResolvedValue([globalExercise, ownedExercise]);

      await service.findAll("admin-1", undefined, true);

      expect(repo.find).toHaveBeenCalledWith({
        where: {},
        order: { slug: "ASC" },
      });
    });

    it("applies muscle_group filter", async () => {
      repo.find!.mockResolvedValue([]);

      await service.findAll("user-1", MuscleGroup.BACK, false);

      expect(repo.find).toHaveBeenCalledWith({
        where: [
          { is_global: true, muscle_group: MuscleGroup.BACK },
          { created_by: "user-1", muscle_group: MuscleGroup.BACK },
        ],
      });
    });
  });

  describe("findOne", () => {
    it("returns exercise when global", async () => {
      repo.findOne!.mockResolvedValue(globalExercise);

      const result = await service.findOne("ex-global", "user-1", false);

      expect(result).toEqual(globalExercise);
    });

    it("throws NotFoundException when missing", async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(
        service.findOne("missing", "user-1", false),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException for non-owner, non-global, non-admin", async () => {
      repo.findOne!.mockResolvedValue(ownedExercise);

      await expect(
        service.findOne("ex-owned", "other-user", false),
      ).rejects.toThrow(ForbiddenException);
    });

    it("allows admin to access any exercise", async () => {
      repo.findOne!.mockResolvedValue(ownedExercise);

      const result = await service.findOne("ex-owned", "other-user", true);

      expect(result).toEqual(ownedExercise);
    });
  });

  describe("create", () => {
    it("sets created_by and is_global from caller", async () => {
      const dto = { slug: "squat", muscle_group: MuscleGroup.LEGS };
      repo.create!.mockReturnValue({ ...dto, created_by: "user-1", is_global: true });
      repo.save!.mockImplementation((e) => Promise.resolve(e));

      await service.create(dto as any, "user-1", true);

      expect(repo.create).toHaveBeenCalledWith({
        ...dto,
        created_by: "user-1",
        is_global: true,
      });
    });
  });

  describe("update", () => {
    it("throws NotFoundException when missing", async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(
        service.update("missing", {}, "user-1", false),
      ).rejects.toThrow(NotFoundException);
    });

    it("throws ForbiddenException when non-owner non-admin updates", async () => {
      repo.findOne!.mockResolvedValue(ownedExercise);

      await expect(
        service.update("ex-owned", { notes: "x" }, "other-user", false),
      ).rejects.toThrow(ForbiddenException);
    });

    it("allows owner to update their own exercise", async () => {
      repo.findOne!.mockResolvedValue({ ...ownedExercise });
      repo.save!.mockImplementation((e) => Promise.resolve(e));

      const result = await service.update(
        "ex-owned",
        { notes: "updated" },
        "user-1",
        false,
      );

      expect(result.notes).toBe("updated");
    });
  });

  describe("remove", () => {
    it("throws NotFoundException when missing", async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.remove("missing", "user-1", false)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("throws ForbiddenException when non-owner non-admin removes", async () => {
      repo.findOne!.mockResolvedValue(ownedExercise);

      await expect(
        service.remove("ex-owned", "other-user", false),
      ).rejects.toThrow(ForbiddenException);
    });

    it("allows admin to remove any exercise", async () => {
      repo.findOne!.mockResolvedValue(ownedExercise);
      repo.remove!.mockResolvedValue(ownedExercise);

      await service.remove("ex-owned", "admin-1", true);

      expect(repo.remove).toHaveBeenCalledWith(ownedExercise);
    });
  });
});
