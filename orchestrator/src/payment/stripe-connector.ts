/**
 * @description
 * The StripeConnector module manages payment processing for ComputeFabric jobs.
 * It interfaces with the Stripe API to charge users for GPU compute time and
 * track provider earnings.
 *
 * Key features:
 * - Charge users for completed jobs
 * - Record payment attempts and results
 * - Calculate provider earnings
 *
 * @dependencies
 * - stripe: The Stripe SDK for Node.js
 * - db: Database connection for payment records
 *
 * @notes
 * - For MVP, we implement basic charge functionality
 * - Future versions could use Stripe Connect for automated payouts to providers
 */

import Stripe from 'stripe';
import { db, payments } from '../db';
import { v4 as uuidv4 } from 'uuid';

// Initialize Stripe with API key from environment variables
const stripeApiKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = new Stripe(stripeApiKey, {
  apiVersion: '2023-08-16'
});

/**
 * Interface for payment result
 */
export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  amount: number;
}

/**
 * The StripeConnector class for handling payments
 */
export class StripeConnector {
  /**
   * Check if Stripe is properly configured
   * @returns True if Stripe is configured, false otherwise
   */
  isConfigured(): boolean {
    return !!stripeApiKey;
  }
  
  /**
   * Charge a user for a completed job
   * @param jobId - The ID of the job
   * @param userId - The ID of the user to charge
   * @param amount - The amount to charge in USD (e.g., 2.50 for $2.50)
   * @param description - Description of the charge
   * @returns Payment result with success/failure status
   */
  async chargeForJob(
    jobId: string,
    userId: string,
    amount: number,
    description: string
  ): Promise<PaymentResult> {
    if (!this.isConfigured()) {
      console.warn('Stripe is not configured. Payment simulation mode enabled.');
      return this.simulatePayment(jobId, amount);
    }
    
    try {
      // For real implementation:
      // 1. Look up the user in your database to get their Stripe Customer ID
      // 2. If they don't have one, create a Stripe Customer for them
      // 3. Charge their payment method
      
      // For MVP, we'll create a simple PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        description: description,
        metadata: {
          jobId,
          userId
        }
      });
      
      // Record the payment in our database
      const paymentId = uuidv4();
      await db.insert(payments).values({
        id: paymentId,
        jobId,
        amount: amount.toString(),
        status: 'pending', // Will be updated via webhook or direct status check
        createdAt: new Date()
      });
      
      return {
        success: true,
        paymentId,
        amount
      };
    } catch (error) {
      console.error('Stripe payment failed:', error);
      
      // Record the failed payment attempt
      const paymentId = uuidv4();
      await db.insert(payments).values({
        id: paymentId,
        jobId,
        amount: amount.toString(),
        status: 'failed',
        createdAt: new Date()
      });
      
      return {
        success: false,
        paymentId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        amount
      };
    }
  }
  
  /**
   * Get a fixed price rate for compute time
   * @returns Rate in USD per minute
   */
  getComputeRate(): number {
    // For MVP, use a simple fixed rate
    // Future: implement tiered pricing based on GPU type, memory, etc.
    return 0.10; // $0.10 per minute
  }
  
  /**
   * Calculate the cost for a job based on duration
   * @param startTime - When the job started
   * @param endTime - When the job ended
   * @returns Cost in USD
   */
  calculateJobCost(startTime: Date, endTime: Date): number {
    // Calculate duration in minutes
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = durationMs / 1000 / 60;
    
    // Calculate cost based on rate
    const rate = this.getComputeRate();
    const cost = durationMinutes * rate;
    
    // Return rounded to 2 decimal places
    return Math.round(cost * 100) / 100;
  }
  
  /**
   * Calculate provider earnings for a job
   * @param jobCost - The total cost charged to the user
   * @returns Provider's share in USD
   */
  calculateProviderEarnings(jobCost: number): number {
    // For MVP, providers earn 80% of the job cost
    const providerShare = 0.8;
    return Math.round(jobCost * providerShare * 100) / 100;
  }
  
  /**
   * Simulate a payment (used when Stripe is not configured)
   * @param jobId - The ID of the job
   * @param amount - The amount to charge
   * @returns Simulated payment result
   */
  private async simulatePayment(jobId: string, amount: number): Promise<PaymentResult> {
    console.log(`Simulating payment of $${amount} for job ${jobId}`);
    
    // Random success with 95% probability
    const success = Math.random() < 0.95;
    
    // Create a payment record
    const paymentId = uuidv4();
    await db.insert(payments).values({
      id: paymentId,
      jobId,
      amount: amount.toString(),
      status: success ? 'succeeded' : 'failed',
      createdAt: new Date()
    });
    
    if (success) {
      return {
        success: true,
        paymentId,
        amount
      };
    } else {
      return {
        success: false,
        paymentId,
        error: 'Simulated payment failure',
        amount
      };
    }
  }
}

// Export a singleton instance for use throughout the application
export const stripeConnector = new StripeConnector();