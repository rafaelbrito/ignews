import { stripe } from "@/src/services/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

export default async (request: NextApiRequest, response: NextApiResponse) => {
    if (request.method === 'POST') {
        const session = await getSession({ req: request })

        const striperCustomer = await stripe.customers.create({
            email: session?.user?.email || '',
        })

        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: striperCustomer.id,
            payment_method_types: ['card'],
            billing_address_collection: 'required',
            line_items: [{
                price: 'price_1PVKYxRpSb4BBWfESPIlhFx9', quantity: 1
            }],
            mode: 'subscription',
            allow_promotion_codes: true,
            success_url: `${request.headers.origin}/posts`,
            cancel_url: `${request.headers.origin}`,
        })
        return response.status(200).json({ sessionId: stripeCheckoutSession.id })
    }
    else {
        response.setHeader('Allow', 'POST')
        response.status(405).end('Method not allowed')
    }
}