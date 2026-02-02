import { ApifyClient } from 'apify-client'

const client = new ApifyClient({
    token: process.env.APIFY_API_TOKEN!,
})

export async function scrapeLinkedInProfile(profileUrl: string) {
    const input = {
        startUrls: [{ url: profileUrl }],
    }

    const run = await client.actor('dev_fusion/linkedin-profile-scraper').call(input)
    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    return items[0] // Return first result
}

export async function scrapeLinkedInJob(jobUrl: string) {
    const input = {
        startUrls: [{ url: jobUrl }],
    }

    const run = await client.actor('curious_coder/linkedin-jobs-scraper').call(input)
    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    return items[0]
}
