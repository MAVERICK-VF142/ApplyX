import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
})

export async function generatePersonalizedEmail(
  resumeText: string,
  postText: string,
  authorName: string,
  userName: string = "User",
  portfolioUrl: string = ""
) {
  const prompt = `
You are a software engineer writing a real outreach email to another engineer/founder.

You are NOT a marketer.
You are NOT a job seeker begging for a role.
You are a builder who ships real products.

---

WRITING STYLE

- Direct, clear, and human
- Slightly informal but still professional
- No buzzwords, no corporate tone
- Sounds like someone who builds and ships things
- Confident, not needy
- USE PARAGRAPHS: Use double line breaks (\n\n) to separate the greeting, intro, body, and sign-off.

---

CONTEXT

RESUME (trimmed):
${resumeText.substring(0, 3000)}

LINKEDIN POST:
"${postText}"

PERSON YOU'RE WRITING TO:
${authorName}

MY PORTFOLIO:
${portfolioUrl || "None"}

MY NAME:
${userName}

---

GOAL

Write a short, highly personalized outreach email to ${authorName} based on their post.

---

HOW TO WRITE

1. Start naturally on a new line
   (e.g. "Hey ${authorName},\n\n" or "Hi — saw your post about X\n\n")

2. Reference 1–2 SPECIFIC things from their post
   (tech, problem, hiring need, product, etc.)

3. Connect with your experience:
   - Use a new paragraph for your experience and value.
   - Focus on building products (0 → 1), shipping, and SaaS/AI.

4. Mention your portfolio naturally if a link is provided.

5. Keep it tight (80–120 words max)

6. End simply on a new line:
   (e.g. "\n\nHappy to chat if this aligns!")

---

IMPORTANT PERSONALIZATION RULES

- DO NOT mention specific past company names
- DO NOT highlight niche features
- DO NOT sound like listing resume experience
- DO NOT generalize — stay specific to the post

---

STRICT RULES

- NO generic candidate phrases (e.g. "excited to apply", "best fit")
- NO emojis, NO bullet points
- 2-3 PARAGRAPHS max with \n\n spacing
- **PORTFOLIO**: If My Portfolio is "None", DO NOT mention or invent a link.
- **SUBJECT**: Must be "Application for [Role], [Stack] | ${userName}"
- Use the primary role and tech stack from the post and resume.
- DO NOT use any other format. Always end with " | ${userName}".

---

OUTPUT FORMAT:
Return ONLY valid JSON with no extra text:
{
  "subject": "string",
  "body": "string"
}
`

  const response = await client.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI assistant that writes personalized job outreach emails in JSON format.",
      },
      { role: "user", content: prompt },
    ],
    model: "llama-3.1-8b-instant",
    response_format: { type: "json_object" },
  })

  const content = response.choices[0].message.content
  if (!content) throw new Error("Failed to generate email content")

  return JSON.parse(content)
}
