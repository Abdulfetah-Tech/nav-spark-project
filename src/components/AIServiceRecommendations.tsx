import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const AIServiceRecommendations = () => {
  const [query, setQuery] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getRecommendations = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-service-recommendations', {
        body: { userQuery: query }
      });

      if (error) throw error;

      setRecommendation(data.recommendation);
    } catch (error) {
      console.error('Recommendation error:', error);
      toast({
        title: "Error",
        description: "Failed to get recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-3xl">AI Service Recommendations</CardTitle>
            <CardDescription className="text-lg">
              Tell us what you need, and our AI will recommend the perfect services for you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                getRecommendations();
              }}
              className="flex gap-2"
            >
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E.g., 'I need to renovate my kitchen' or 'Looking for emergency plumbing'"
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </form>

            {recommendation && (
              <Card className="bg-muted">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">AI Recommendations:</h3>
                  <p className="whitespace-pre-line">{recommendation}</p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
