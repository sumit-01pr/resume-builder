import ai from "../configs/ai.js";
import Resume from "../models/Resume.js";

//controller for enhanching a reumme's professional summary  ai
// POST:/api/ai/enhance-pro-summary
export const enhanceProfessionalSummary = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ message: 'Missing  required fields' })
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert in resume writing. your task it to enhance the professional summary of a resume.The summary should be 1-2 sentences long and should highlight the key skills and experience, and caree objectives. make it compelling and ATS- friendly. and only return text no options or any thing else.',
                },
                {
                    role: 'user',
                    content: userContent,
                }
            ]
        })
        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({ enhancedContent })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

// controller for generating resume's job description 
// POST:/api/ai/enhance-job-description
export const enhanceJobDescription = async (req, res) => {
    try {
        const { userContent } = req.body;

        if (!userContent) {
            return res.status(400).json({ message: 'Missing  required fields' })
        }

        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert in resume writing. your task it to enhance the job description of a resume.The job description  should be only 1-2 sentences also highlighting key responsibilities and achivements. Use action verbs and quantifiable results where possible. Make  it  ATS-friendly. and only return text no options or any thing else.',
                },
                {
                    role: 'user',
                    content: userContent,
                }
            ]
        })
        const enhancedContent = response.choices[0].message.content;
        return res.status(200).json({ enhancedContent })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}

//controller for uploading a resume to the database 
// POST:/api/ai/upload-resume

export const uploadResume = async (req, res) => {
    try {

        const { resumeText, title } = req.body;
        const userId = req.userId;
        if (!resumeText) {
            return res.status(400).json({ message: 'Missing  required fields' })
        }

        const systemPrompt = "You are an expert AI Agent to extract data from resume."

        const userPrompt = `extract data from this resume:${resumeText}
        
        Provide data in the following JSON formate with no additinal text before or after:
         
        {
           professional_summary: { type: String, default: '' },
  skills: [{ type: String }],
  personal_info: {
    image: { type: String, default: '' },
    full_name: { type: String, default: '' },
    profession: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  experience:[
    {
        company:{type:string},
        position:{type:string},
        start_date:{type:string},
        description:{type:string},
        is_current:{type:string},
    }
  ],
  project:[
     {
        name:{type:string},
        type:{type:string},
        description:{type:string},
    }
  ],
  education:[
    {
        institution:{type:string},
        degree:{type:string},
        field:{type:string},
        graduation_date:{type:string},
        gpa:{type:string},
    }
  ],
        }
        
        `
        const response = await ai.chat.completions.create({
            model: process.env.OPENAI_MODEL,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: userPrompt,
                }
            ],
            response_format: { type: "json_object" }
        })
        const extractedData = response.choices[0].message.content;
        const parseData = JSON.parse(extractedData)
        const newResume = await Resume.create({ userId, title, ...parseData })
        res.json({ resumeId: newResume._id })
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}