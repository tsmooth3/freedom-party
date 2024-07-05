import { json } from '@sveltejs/kit';
import prisma from '$lib/server/prisma';
import { Prisma } from '@prisma/client'
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {

    if (url.searchParams.get('slider') && url.searchParams.get('speed')) {

        const slideName = String(url.searchParams.get('slider'))
        const slideFPS = Number(url.searchParams.get('speed'))
        const slideMPHstring = (slideFPS / 1.467).toFixed(1)
        const slideMPH: Prisma.Decimal = new Prisma.Decimal(slideMPHstring)
        try {
            await prisma.slides.create({
                data: {
                    sliderName: slideName,
                    sliderFPS: slideFPS,
                    sliderMPH: slideMPH
                }
            })
            return json({ success: true })
        } catch (error) {
            return json({ success: false, message: error })
        }
    } else {
        return json({ success: false, message: "missing required params" })
    }
};