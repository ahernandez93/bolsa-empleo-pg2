import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon } from "lucide-react";

function insertAround(selection: string, wrapL: string, wrapR: string) {
    const s = selection || "";
    return `${wrapL}${s}${wrapR}`;
}
function insertPrefix(selection: string, prefix: string) {
    const lines = (selection || "").split("\n");
    return lines.map(l => (l ? `${prefix} ${l}` : prefix)).join("\n");
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DescripcionPuestoField({ form }: { form: any }) {
    return (
        <FormField
            control={form.control}
            name="descripcionPuesto"
            render={({ field }) => (
                <FormItem className="col-span-3">
                    <FormLabel>Descripción del Puesto</FormLabel>

                    <Tabs defaultValue="edit" className="w-full">
                        <div className="flex items-center justify-between">
                            <TabsList>
                                <TabsTrigger value="edit">Editar</TabsTrigger>
                                <TabsTrigger value="preview">Previsualizar</TabsTrigger>
                            </TabsList>

                            {/* mini-toolbar */}
                            <div className="flex gap-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title="Negrita"
                                    onClick={() => field.onChange(insertAround(field.value, "**", "**"))}
                                >
                                    <Bold className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title="Cursiva"
                                    onClick={() => field.onChange(insertAround(field.value, "_", "_"))}
                                >
                                    <Italic className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title="Lista"
                                    onClick={() => field.onChange(insertPrefix(field.value, "-"))}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title="Lista numerada"
                                    onClick={() => field.onChange(insertPrefix(field.value, "1."))}
                                >
                                    <ListOrdered className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    title="Link"
                                    onClick={() =>
                                        field.onChange(field.value + (field.value ? "\n" : "") + "[texto](https://)")
                                    }
                                >
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <TabsContent value="edit">
                            <FormControl>
                                <Textarea
                                    placeholder="Usa Markdown: **negrita**, _cursiva_, listas, [links](https://...)"
                                    {...field}
                                    rows={10}
                                    className="font-mono"
                                />
                            </FormControl>
                        </TabsContent>

                        <TabsContent value="preview">
                            <div className="prose prose-slate max-w-none dark:prose-invert border rounded-md p-4">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {field.value || "*Sin contenido*"}
                                </ReactMarkdown>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
