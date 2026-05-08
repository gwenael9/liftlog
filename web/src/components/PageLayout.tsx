import { Button } from "./ui/button";

interface PageLayoutProps<T> {
    title: string;
    onClickCreate: () => void;
    female?: boolean;
    data: {
        isLoading: boolean;
        items: T[];
    }
    form: {
        show: boolean;
        content: React.ReactNode;
        subForm?: React.ReactNode;
    }
    children: React.ReactNode;
}

export default function PageLayout<T>({ title, onClickCreate, female = false, form, data, children }: PageLayoutProps<T>) {

    return (
        <div className="max-w-2xl mx-auto p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{title}s</h2>
                <Button size="sm" onClick={onClickCreate}>
                    {female ? 'Nouvelle': 'Nouveau'} {title.toLowerCase()}
                </Button>
            </div>

            {form.show && form.content}
            {form.subForm}

            {data.isLoading && (
                <p className="text-center text-muted-foreground py-8">Chargement...</p>
            )}

            {!data.isLoading && data.items.length === 0 && (
                <p className="text-center text-muted-foreground py-8">Aucun{female ? 'e' : ''} {title.toLowerCase()} ce mois-ci</p>
            )}

            <div className="space-y-2">
                {children}
            </div>

        </div>

    )

}