import { insertTransactionSchema } from '../shared/schema';
import { z } from 'zod';

const transactionFormSchema = insertTransactionSchema.extend({
    amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "Amount must be a positive number",
    }),
    fraudScore: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0 && parseFloat(val) <= 100, {
        message: "Fraud score must be between 0 and 100",
    }),
});

try {
    const result = transactionFormSchema.parse({
        userId: '0x792c67F9732DAD7AD1076e3b8c5D450234037ad1',
        amount: '1000',
        recipient: '0x282397Ac262F622481D1FB73c6BFE1',
        isFraudulent: false,
        fraudScore: '0',
        status: 'verified',
        description: ''
    });
    console.log('Validation SUCCESS:', result);
} catch (e: any) {
    console.error('Validation FAILED:', JSON.stringify(e.errors, null, 2));
}
