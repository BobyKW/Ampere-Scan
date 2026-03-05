'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating personalized battery optimization recommendations.
 *
 * - batteryOptimizationRecommendations - A function that handles the battery optimization recommendation process.
 * - BatteryOptimizationInput - The input type for the batteryOptimizationRecommendations function.
 * - BatteryOptimizationOutput - The return type for the batteryOptimizationRecommendations function.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Input Schema Definition
const BatteryOptimizationInputSchema = z.object({
  userApiKey: z.string().describe("User's own Gemini API Key."),
  currentBatteryLevel: z.number().min(0).max(100).describe("Current battery charge level in percentage (0-100)."),
  isCharging: z.boolean().describe("True if the device is currently charging, false otherwise."),
  batteryHealthStatus: z.string().describe("Current battery health status (e.g., 'Good', 'Fair', 'Poor', 'Unknown')."),
  batteryTechnology: z.string().describe("Battery technology type (e.g., 'Li-ion', 'Li-poly')."),
  totalDesignCapacityMah: z.number().describe("Battery's total maximum design capacity in milliampere-hours (mAh)."),
  currentMilliAmp: z.number().describe("Current charge/discharge rate in mA. Positive for charging, negative for discharging."),
  voltage: z.number().describe("Current battery voltage in millivolts (mV)."),
  temperatureCelsius: z.number().describe("Current battery temperature in Celsius."),
  deviceOsVersion: z.string().describe("Android operating system version."),
  deviceManufacturer: z.string().describe("Device manufacturer (e.g., 'Samsung', 'Google')."),
  deviceModel: z.string().describe("Specific device model number (e.g., 'Pixel 8 Pro')."),
  historicalUsageSummary: z.string().describe("A summary of historical battery usage patterns and pain points."),
});
export type BatteryOptimizationInput = z.infer<typeof BatteryOptimizationInputSchema>;

// Output Schema Definition
const BatteryOptimizationOutputSchema = z.object({
  overallRecommendation: z.string().describe("A general, concise recommendation based on the analysis of current and historical data."),
  personalizedTips: z.array(z.string()).describe("An array of specific, actionable tips to improve battery life and performance."),
  performanceMetricsImpact: z.string().describe("An explanation of how applying these tips is expected to impact battery performance metrics."),
});
export type BatteryOptimizationOutput = z.infer<typeof BatteryOptimizationOutputSchema>;

// Wrapper Function
export async function batteryOptimizationRecommendations(input: BatteryOptimizationInput): Promise<BatteryOptimizationOutput> {
  // Initialize Genkit dynamically with the user's API Key
  const ai = genkit({
    plugins: [googleAI({ apiKey: input.userApiKey })],
    model: 'googleai/gemini-2.5-flash',
  });

  const batteryOptimizationPrompt = ai.definePrompt({
    name: 'batteryOptimizationPrompt',
    input: { schema: BatteryOptimizationInputSchema },
    output: { schema: BatteryOptimizationOutputSchema },
    prompt: `You are an expert mobile device battery optimization assistant. Your goal is to provide personalized, actionable recommendations to improve device battery life and performance. Analyze the provided real-time and historical battery usage data and offer specific advice.

Current Device and Battery Status:
- Battery Level: {{{currentBatteryLevel}}}%
- Charging Status: {{#if isCharging}}Charging{{else}}Discharging{{/if}}
- Battery Health: {{{batteryHealthStatus}}}
- Battery Technology: {{{batteryTechnology}}}
- Total Design Capacity: {{{totalDesignCapacityMah}}} mAh
- Current mA Rate: {{{currentMilliAmp}}} mA
- Voltage: {{{voltage}}} mV
- Temperature: {{{temperatureCelsius}}}°C
- Device OS: {{{deviceOsVersion}}}
- Manufacturer: {{{deviceManufacturer}}}
- Model: {{{deviceModel}}}

Historical Usage Patterns Summary:
{{{historicalUsageSummary}}}

Based on this information, provide:
1. An overall recommendation.
2. A list of personalized, actionable tips to optimize battery life.
3. An explanation of the expected impact on battery performance metrics.`,
  });

  const { output } = await batteryOptimizationPrompt(input);
  
  if (!output) {
    throw new Error("No se pudo generar el análisis. Verifica tu API Key.");
  }
  
  return output;
}
