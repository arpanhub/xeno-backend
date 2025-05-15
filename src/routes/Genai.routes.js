const express = require('express');
const router = express.Router();
const {GoogleGenAI} = require('@google/genai');

const genAi = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});

router.post('/',async function(req,res){
    const { campaignName, description, audienceSize } = req.body;
    console.log(campaignName);
    try{
        const prompt = `
         Generate a professional, engaging marketing message for a campaign.
         Campaign Name: ${campaignName}
         Description: ${description || "No description provided"}
          Target Audience Size: ${audienceSize || "Unknown"}
           The tone should be friendly and encouraging.
      Keep it under 100 words.`;
      const result = await genAi.models.generateContent({
        model:"gemini-2.0-flash",
        contents:prompt
      });
      const message = result.text;
      console.log(message);
      return res.status(200).json({message});
    }catch(error){
        console.error('Error generating message:', error.message);
        res.status(500).json({ error: 'Failed to generate message' });
    }
})

router.post('/analytics',async function(req,res){
  const {
        totalCustomersCount,
        recentOrdersCount,
        activeCampaignsCount,
        completedOrdersCount,
        pendingOrdersCount,
        cancelledOrdersCount,
        topCustomerCount,
  } = req.body;

  try{
    const prompt =`
      Analyze this business data and provide actionable insights and recommendations:
      -Total Customers Count: ${totalCustomersCount}
      -Recent Orders Count: ${recentOrdersCount}
      -Active Campaigns Count: ${activeCampaignsCount}
      -Completed Orders Count: ${completedOrdersCount}
      -Pending Orders Count: ${pendingOrdersCount}
      -Cancelled Orders Count: ${cancelledOrdersCount}
      -Top Customer Count: ${topCustomerCount}

     Format the response as JSON with two properties:
        1. "summary": A concise 1-2 sentence overview of the business situation
        2. "recommendations": An array of 3-4 actionable recommendations based on the data
        
        Keep the tone professional and constructive. Focus on revenue growth, customer retention, and operational efficiency.
        `;
 
    const result = await genAi.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt
    });
    

    
    
    let cleanedResponse = result.text;
    
  
    if (cleanedResponse.includes('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\s*/g, '');
        cleanedResponse = cleanedResponse.replace(/\s*```/g, '');
    }
    
    try {
        const parsedResponse = JSON.parse(cleanedResponse);
        return res.status(200).json({ message: parsedResponse });
    } catch (parseError) {
        console.log('Parse error after cleaning response:', parseError.message);
        
        
        return res.status(200).json({ 
            message: {
                summary: "Unable to format response as JSON. Please see raw response.",
                raw: cleanedResponse
            }
        });
    }
  }
  catch(error){
        console.error('Error generating analytics:', error.message);
        res.status(500).json({ error: 'Failed to generate analytics' });
    }
})
module.exports = router;