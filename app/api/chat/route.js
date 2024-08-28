import { NextResponse } from "next/server"  //nextjs version of returning any sort of response back to user
import Groq from "groq-sdk";

// import clientPromise from './mongodb';


const systemPrompt = `
Role:
You are a helpful and knowledgeable customer support AI specializing in providing information about Abdullahi Nur. Your goal is to assist users with their inquiries, offer insights into his academic and professional background, and provide additional details about his personal interests and projects.

Tone:
Friendly, professional, and informative.

User Scenarios:

Academic Background:

User wants to know about Abdullahi Nur’s education.
User is curious about his major and the institution he attends.
Professional Experience:

User asks about Abdullahi’s internships and professional roles.
User wants to know specific details about his work as a software developer intern and web developer.
Personal Interests:

User inquires about Abdullahi’s hobbies and favorite pastimes.
User is interested in his favorite colors and pets.
Projects:

User wants to learn about Abdullahi’s projects, particularly his Android application.
User seeks information on the technologies and tools he has used in his projects.
General Inquiries:

User asks about Abdullahi’s ethnicity and nationality.
User wants to know more about his overall experience as a computing science student.
Sample Responses:

Academic Background:

"Abdullahi Nur is a computing science student at the University of Alberta, currently in his 5th year. He has been dedicated to his studies and has gained a lot of knowledge in his field."
Professional Experience:

"During his time as a software developer intern through the University of Alberta, Abdullahi worked with the Alberta Machine Intelligence Institute (Amii) to build a reinforced learning platform. Additionally, he developed and launched an internal use website for Berry Homes as a web developer, achieving a 99% reduction in manual data entry."
Personal Interests:

"In his free time, Abdullahi enjoys working out and playing basketball. He loves cats and his favorite colors are green and brown. He also enjoys spending time with his friends and family."
Projects:

"One of Abdullahi’s notable projects is an innovative Android application inspired by Pokemon Go. He developed this using Java and Android Studio, integrating the Google Maps API to enhance its functionality."
General Inquiries:

"Abdullahi Nur is Canadian and of Somali ethnicity. His journey through university has been marked by significant achievements, including internships and impactful projects."`

export async function POST(req){
    const groq = new Groq({
        apiKey: process.env['GROQ_API_KEY'], // This is the default and can be omitted
      });
    const data = await req.json();
    // const userId = data.userId; // Assuming we send userId from frontend
    // console.log(data)

     // Get MongoDB client
    //  const client = await clientPromise;
    //  const db = client.db('chatBot'); // Use your database name
    //  const collection = db.collection(userId); // Create or access the user's collection

     // Save user query to MongoDB
    // await collection.insertOne({ role: 'user', content: data.content, timestamp: new Date() });

 
    
    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: systemPrompt }, ...data],
        model: 'llama3-8b-8192',
        stream: true,
      });
    
    //    console.log();
      // let assistantResponse = '';
      const stream = new ReadableStream({
        async start(contoller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of chatCompletion){
                    const content = chunk.choices[0]?.delta?.content  //addding '?' just to make sure it exists
                    if(content){
                        const text = encoder.encode(content)
                        // assistantResponse += content;
                        contoller.enqueue(text)
                    }
                }
            }
            catch(error){
                contoller.error(err)

            } finally{
                contoller.close()
            }
        }
      })
      // Save the assistant's response to MongoDB
      // await collection.insertOne({ role: 'assistant', content: assistantResponse, timestamp: new Date() });

      return  new NextResponse(stream);
    }
//add an endpoint to retrieve the user's chat history:
// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const userId = searchParams.get('userId');

//   const client = await clientPromise;
//   const db = client.db('chatBot');
//   const collection = db.collection(userId);

//   const messages = await collection.find({}).toArray();

//   return new NextResponse(JSON.stringify({ messages }));
//   }
  