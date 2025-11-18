import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch pharmacy data from database
    const { data: drugs, error: dbError } = await supabase
      .from('Drugs dataset')
      .select('*');

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to fetch pharmacy data');
    }

    console.log(`Fetched ${drugs?.length || 0} drugs from database`);

    // Prepare data summary for AI analysis
    const dataSummary = drugs?.slice(0, 100).map(drug => ({
      name: drug.name,
      stock: drug.stock,
      price_EGP: drug.price_EGP,
      price_USD: drug.price_USD,
      date: drug.date
    })) || [];

    const prompt = `You are a pharmaceutical inventory forecasting expert. Analyze the following pharmacy inventory data and provide detailed forecasting insights.

Pharmacy Data (first 100 items):
${JSON.stringify(dataSummary, null, 2)}

Total items in inventory: ${drugs?.length || 0}

Please provide a comprehensive forecasting analysis including:

1. **Demand Forecast**: Predict demand trends for the next 3-6 months based on current stock levels and patterns
2. **Stock Optimization**: Identify overstocked and understocked items
3. **Seasonal Patterns**: Note any seasonal trends you observe
4. **Revenue Projections**: Estimate revenue potential based on pricing and stock
5. **Reorder Recommendations**: Suggest which items need immediate reordering
6. **Risk Analysis**: Identify potential stockouts or excess inventory risks
7. **Key Insights**: Provide 3-5 actionable insights for inventory management

Format your response in clear sections with specific numbers and recommendations.`;

    console.log('Calling OpenAI API...');

    // Call OpenAI API (OpenRouter endpoint based on the API key format)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': supabaseUrl,
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert pharmaceutical inventory analyst with deep knowledge of demand forecasting, inventory optimization, and pharmacy operations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const forecast = data.choices[0].message.content;

    console.log('Forecast generated successfully');

    return new Response(
      JSON.stringify({ 
        forecast,
        dataAnalyzed: drugs?.length || 0,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in generate-forecast function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
