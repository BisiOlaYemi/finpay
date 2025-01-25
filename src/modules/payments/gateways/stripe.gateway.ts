import Stripe from 'stripe';

export class StripePaymentGateway {
  private stripe: Stripe;

  constructor() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error('is STRIPE_SECRET_KEY defined in the environment variables');
    }

    this.stripe = new Stripe(stripeSecretKey, {
        apiVersion: '2024-12-18.acacia',
    });
  }

  async processPayment(amount: number, sourceAccountId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount * 100, 
        currency: 'usd',
        payment_method: sourceAccountId,
      });

      return {
        transactionId: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error: any) {
      throw new Error(`Stripe payment failed: ${error.message}`);
    }
  }
}
