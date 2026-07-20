import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    return {
        isAdmin: locals.isAdmin
    };
};

export const actions: Actions = {
    submitSpeed: async ({ fetch, request, locals }) => {
        // Backend authorization check
        if (!locals.isAdmin) {
            return fail(403, { unauthorized: true, message: 'Only administrators can submit slider speeds.' });
        }

        const formData = await request.formData();
        const slideName = String(formData.get('slider') || '').trim();
        const slideSpeed = Number(formData.get('speed'));

        if (!slideName) {
            return fail(400, { incorrect: true, message: 'Slider name is required.' });
        }
        if (isNaN(slideSpeed) || slideSpeed <= 0) {
            return fail(400, { incorrect: true, message: 'Speed must be greater than 0.' });
        }

        await fetch('/api/submitSlide?slider=' + encodeURIComponent(slideName) + '&speed=' + slideSpeed);
        return { success: true };
    }
};
