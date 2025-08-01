"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Pill, AlertTriangle, ClipboardPlus, Replace, PlusCircle, XCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { performAnalysis } from './actions';
import type { DrugInteractionAnalysisOutput } from '@/ai/flows/drug-interaction-analysis';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  medications: z.array(
    z.object({ name: z.string().min(1, { message: "Medication name is required." }) })
  ).min(1, { message: "At least one medication is required." }),
  age: z.coerce.number({invalid_type_error: "Age must be a number."}).min(1, { message: "Age must be at least 1." }).max(120, { message: "Please enter a valid age." }),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<DrugInteractionAnalysisOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medications: [{ name: '' }],
      age: undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setAnalysisResult(null);
    
    const analysisInput = {
      medications: data.medications.map(m => m.name),
      age: data.age
    };

    const result = await performAnalysis(analysisInput);

    setIsLoading(false);
    if (result.success && result.data) {
      setAnalysisResult(result.data);
    } else {
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: result.error,
      });
    }
  };

  const renderResultContent = (content: string) => {
    if (!content) return <p>No information provided.</p>;
    return content.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
      <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
    ));
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center gap-3">
            <Pill className="h-12 w-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">PillAssist</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your AI-powered guide for medication safety and dosage.
          </p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Medication Analysis</CardTitle>
            <CardDescription>Enter drug names and patient's age to check for interactions and get dosage guidance.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormLabel>Medications</FormLabel>
                  {fields.map((field, index) => (
                    <FormField
                      control={form.control}
                      key={field.id}
                      name={`medications.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input placeholder={`Medication ${index + 1}`} {...field} />
                            </FormControl>
                            {fields.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove medication">
                                <XCircle className="h-5 w-5 text-destructive/70 hover:text-destructive" />
                              </Button>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Medication
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient's Age</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g., 45" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isLoading} className="w-full text-lg py-6">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Medications'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                   <Skeleton className="h-6 w-48" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
            <Card className="shadow-lg">
               <CardHeader className="flex flex-row items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                   <Skeleton className="h-6 w-48" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-6 animate-in fade-in-0 duration-500">
            <h2 className="text-3xl font-bold text-center tracking-tight">Analysis Results</h2>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-destructive/10 p-2 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                  <span>Potential Drug Interactions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-card-foreground">
                {renderResultContent(analysisResult.analysisResults)}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                   <div className="bg-primary/10 p-2 rounded-full">
                    <ClipboardPlus className="h-6 w-6 text-primary" />
                  </div>
                  <span>Age-Specific Dosage Guidance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-card-foreground">
                {renderResultContent(analysisResult.dosageRecommendation)}
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="bg-accent/20 p-2 rounded-full">
                    <Replace className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <span>Alternative Medication Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none text-card-foreground">
                {renderResultContent(analysisResult.alternativeMedications)}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
