import { ChangelogEntry, ChangeType } from "@/lib/changelog-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Tag } from "lucide-react";

interface ChangelogItemProps {
    entry: ChangelogEntry;
}

export function ChangelogItem({ entry }: ChangelogItemProps) {
    const getTypeColor = (type: ChangeType) => {
        switch (type) {
            case 'feature': return "bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-200";
            case 'improvement': return "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-200";
            case 'fix': return "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getTypeLabel = (type: ChangeType) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <Card className="mb-8 relative overflow-hidden border-l-4 border-l-primary">
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-lg px-3 py-1 bg-background">
                            v{entry.version}
                        </Badge>
                        <CardTitle className="text-xl">{entry.title}</CardTitle>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full w-fit">
                        <Calendar className="h-4 w-4 mr-2" />
                        {entry.date}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {entry.changes.map((change, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <Badge variant="outline" className={`mt-0.5 shrink-0 ${getTypeColor(change.type)}`}>
                                {getTypeLabel(change.type)}
                            </Badge>
                            <span className="text-muted-foreground leading-relaxed">
                                {change.description}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
