import type { PageServerLoad } from "./$types";
import type { Actions } from "@sveltejs/kit";
import type { prismaSlide } from "$lib/shared/utils";
import { invalidateAll } from "$app/navigation";

export const load: PageServerLoad = async ({ fetch }) => {
    try {
        const dbSlidesResponse = await fetch('/api/slides')
        const dbSlides: prismaSlide[] = await dbSlidesResponse.json()
        return { dbSlides}
    } catch (error) {
        const dbSlides: prismaSlide[] = []
        return { dbSlides }
    }
};

export const actions: Actions = {
    submitSpeed: async ({ fetch, request }) => {
        const formData = await request.formData()
        const slideName = String(formData.get('slider'))
        const slideSpeed = Number(formData.get('speed'))
        if (slideSpeed > 0) {
            await fetch('/api/submitSlide?slider=' + slideName + '&speed=' + slideSpeed)
            invalidateAll
            return { success: true }
        }
    }
}