import type { Actions } from "@sveltejs/kit";
import { invalidateAll } from "$app/navigation";

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