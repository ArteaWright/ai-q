export interface ScrollCard {
    id: string
    headline: string
    tagline: string
    body: string
}

export const SCROLL_CARDS: ScrollCard[] = [
    {
        id: 'card-1',
        headline: 'The Noise',
        tagline: '$300 Billion wasted. The technology wasn\'t the problem. The preparation was.',
        body: 'Between 2019 and 2024, 85% of AI projects never made it from pilot to production. Data was messy and teams weren\'t consulted, and the use case wasn\'t clear. Success was never defined before launch. But the organization that failed weren\'t less intelligent, they were just less ready.',
    },
    {
        id: 'card-2',
        headline: 'Deep Discovery',
        tagline: 'The companies that didn\'t go all in on AI, went deeper on the problem.',
        body: 'Businesses that defined a specific problem before selecting an AI tool consistently outperformed those who bought first and searched for a use case after. 40% operational cost reduction, 3x faster decisions. The pattern wasn\'t about speed or budget. It was about clarity.',
    },
    {
        id: 'card-3',
        headline: 'Data Assumptions',
        tagline: 'Tons of data, but is it relevant, clean, and accessible?',
        body: 'Data readiness is 70% of overall readiness, and it\'s the thing almost every organization discovers too late, after the ink on the contract is dried. But for the organizations that succeeded, this was priority number one. They invested in data preparation, and they involved the teams that knew the data best. They didn\'t just buy a tool, they built a foundation.',
    },
    {
        id: 'card-4',
        headline: 'Ready? Now What?',
        tagline: 'Knowing you\'re ready is just the beginning. Knowing what you need is just as important.',
        body: 'The AI conversation is dominated by large language models, but for narrow, repeatable tasks, a small fined-tuned model frequently outperforms a general one and at a fraction of the cost per call. Most importantly, it keeps your data inside your walls.',
    },
    {
        id: 'card-5',
        headline: 'The Landscape',
        tagline: 'Not all AI is the same.',
        body: 'Language models are the most visible, but not the only type of AI. Computer vision handles images. Deterministic AI handles compliance and auditability. While probabilistic AI operates on likelihoods and statistical patters. The right choice depends on the structure of your business and problem. Not the size of the headline.',
    },
    {
        id: 'card-6',
        headline: 'Your Turn',
        tagline: 'Now that you know what to look for, find out where you stand.',
        body: 'AIQ reads the pattern of your answers across six domains — operations, data integrity, human capital, leadership readiness, scalable infrastructure, and security — and tells you which type of AI fits your business and why. Not a generic score. A specific starting point.',
    },
]
