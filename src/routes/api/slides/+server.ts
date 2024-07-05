import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import type { RequestHandler } from './$types';


export let GET: RequestHandler = async ({ url }) => {
    try {
        const slides = await prisma.slides.findMany({
            orderBy: [
                { sliderFPS: 'desc' },
                { timeStamp: 'asc' }
            ]
        })
        return json(slides)
    } catch (error) {
        return json({ success: false, message: error })
    }
};