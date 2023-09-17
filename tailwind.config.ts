import { join } from 'path';
import type { Config } from 'tailwindcss';

// 1. Import the Skeleton plugin
import { skeleton } from '@skeletonlabs/tw-plugin';
import { freedom } from './freedom-theme';

const config = {
    // 2. Opt for dark mode to be handled via the class method
    darkMode: 'class',
    content: [
        './src/**/*.{html,js,svelte,ts}',
        // 3. Append the path to the Skeleton package
        join(require.resolve(
            '@skeletonlabs/skeleton'),
            '../**/*.{html,js,svelte,ts}'
        )
    ],
    theme: {
        extend: {},
        preset: ["skeleton", "modern", "wintry", "crimson"],
        custom: [freedom]
    },
    plugins: [
        // 4. Append the Skeleton plugin (after other plugins)
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('tailwindcss-highlights'),
        skeleton({
            themes: {
                preset: [
                    //Enable 'enhancements per each registered theme:
                    { name: "skeleton", enhancements: true },
                    { name: "modern", enhancements: true },
                    { name: "wintry", enhancements: true },
                    { name: "crimson", enhancements: true },
                ],
                custom: [freedom]
            }
        })
    ]
} satisfies Config;

export default config;