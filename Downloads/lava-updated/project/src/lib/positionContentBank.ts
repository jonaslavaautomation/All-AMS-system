import type { PositionId } from './positionBank';

// ─── Pronunciation ──────────────────────────────────────────

export interface PronunciationItem {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

type PronunciationBank = Record<PositionId, PronunciationItem[]>;

export const POSITION_PRONUNCIATION: PronunciationBank = {
  'insurance-csr': [
    { id: 'icsr-p1', text: "Thank you for calling Global Insurance, how may I help you today?", category: 'Customer Greeting', difficulty: 'easy' },
    { id: 'icsr-p2', text: "Your liability coverage protects you if you are found legally responsible for damages.", category: 'Insurance Terminology', difficulty: 'medium' },
    { id: 'icsr-p3', text: "The deductible is the amount you pay out of pocket before your insurance kicks in.", category: 'Policy Explanation', difficulty: 'medium' },
    { id: 'icsr-p4', text: "Comprehensive coverage pays for damage to your vehicle caused by events other than a collision.", category: 'Insurance Terminology', difficulty: 'hard' },
    { id: 'icsr-p5', text: "I'd be happy to walk you through the claims process step by step over the phone.", category: 'Phone Script', difficulty: 'easy' },
    { id: 'icsr-p6', text: "Your premium may increase upon renewal if there have been any at-fault claims in the past three years.", category: 'Policy Explanation', difficulty: 'hard' },
  ],
  'insurance-sales': [
    { id: 'isales-p1', text: "Good morning, this is Alex from Summit Insurance. I wanted to talk to you about saving on your auto coverage.", category: 'Sales Opening', difficulty: 'easy' },
    { id: 'isales-p2', text: "By bundling your home and auto policies, you could qualify for a significant multi-line discount.", category: 'Value Proposition', difficulty: 'medium' },
    { id: 'isales-p3', text: "Our umbrella policy provides additional liability protection beyond your standard coverage limits.", category: 'Insurance Terminology', difficulty: 'hard' },
    { id: 'isales-p4', text: "I understand you're happy with your current provider, but let me show you what we can offer.", category: 'Objection Handling', difficulty: 'medium' },
    { id: 'isales-p5', text: "Would you like me to prepare a complimentary quote so you can compare side by side?", category: 'Closing Technique', difficulty: 'easy' },
    { id: 'isales-p6', text: "The collision deductible waiver means we'll waive your deductible if the accident wasn't your fault.", category: 'Insurance Terminology', difficulty: 'hard' },
  ],
  'cold-caller': [
    { id: 'cc-p1', text: "Hi, this is Jordan. I'm calling because I believe we can help your business reduce overhead costs.", category: 'Cold Call Opening', difficulty: 'easy' },
    { id: 'cc-p2', text: "I know you weren't expecting my call, so I'll keep this brief — just thirty seconds of your time.", category: 'Gatekeeper Script', difficulty: 'medium' },
    { id: 'cc-p3', text: "Our platform streamlines operations and increases efficiency by automating routine tasks.", category: 'Value Proposition', difficulty: 'medium' },
    { id: 'cc-p4', text: "I understand you're satisfied with your current vendor, but what if I could show you a better way?", category: 'Objection Handling', difficulty: 'hard' },
    { id: 'cc-p5', text: "Would Tuesday morning or Thursday afternoon work better for a brief follow-up conversation?", category: 'Appointment Setting', difficulty: 'easy' },
    { id: 'cc-p6', text: "Even if now isn't the right time, I'd love to send you some information for when it is.", category: 'Rejection Recovery', difficulty: 'medium' },
  ],
  'sdr': [
    { id: 'sdr-p1', text: "Hi, this is Alex. I know this is out of the blue, so I'll keep it short — do you have thirty seconds?", category: 'Cold Open', difficulty: 'easy' },
    { id: 'sdr-p2', text: "Quick question before I go on — are you the right person for decisions about your sales workflow?", category: 'Qualification', difficulty: 'medium' },
    { id: 'sdr-p3', text: "A lot of teams your size tell us their reps waste hours chasing leads that were never a good fit.", category: 'Pain Point Framing', difficulty: 'medium' },
    { id: 'sdr-p4', text: "I completely understand you're happy with your current setup — I'm not asking you to switch anything today.", category: 'Objection Handling', difficulty: 'hard' },
    { id: 'sdr-p5', text: "Would a short twenty-minute call Tuesday afternoon or Wednesday morning work better for you?", category: 'Meeting Booking', difficulty: 'easy' },
    { id: 'sdr-p6', text: "I'll send a calendar invite now so it's locked in, and a quick reminder the morning of so nothing slips.", category: 'No-Show Prevention', difficulty: 'medium' },
  ],
  'appointment-setter': [
    { id: 'as-p1', text: "Hello, I'm calling to schedule your complimentary consultation with one of our specialists.", category: 'Scheduling Script', difficulty: 'easy' },
    { id: 'as-p2', text: "We have availability on Tuesday at two or Thursday at four — which works better for you?", category: 'Confirmation Script', difficulty: 'easy' },
    { id: 'as-p3', text: "I'll send a calendar invitation to your email so you have all the details for the appointment.", category: 'Confirmation Script', difficulty: 'medium' },
    { id: 'as-p4', text: "If something comes up, please call us at least twenty-four hours in advance to reschedule.", category: 'Rescheduling Script', difficulty: 'medium' },
    { id: 'as-p5', text: "I'd like to confirm your preferred contact method — would you prefer a phone call or a video link?", category: 'Qualification Script', difficulty: 'medium' },
    { id: 'as-p6', text: "Our specialist is looking forward to meeting you and discussing how we can support your business goals.", category: 'Professional Closing', difficulty: 'hard' },
  ],
  'executive-assistant': [
    { id: 'ea-p1', text: "Good morning, Mr. Thompson's office. How may I direct your call?", category: 'Professional Greeting', difficulty: 'easy' },
    { id: 'ea-p2', text: "I'll check the executive's calendar and get back to you within the hour with available time slots.", category: 'Calendar Management', difficulty: 'medium' },
    { id: 'ea-p3', text: "The board meeting has been rescheduled to Thursday at ten and all attendees have been notified.", category: 'Meeting Coordination', difficulty: 'medium' },
    { id: 'ea-p4', text: "I've prepared the briefing documents and flagged the items that require your immediate attention.", category: 'Executive Communication', difficulty: 'hard' },
    { id: 'ea-p5', text: "Your flight departs at six forty-five and the car service will arrive at four thirty.", category: 'Travel Coordination', difficulty: 'medium' },
    { id: 'ea-p6', text: "I've prioritized your inbox and highlighted the three emails that need your response before noon.", category: 'Inbox Management', difficulty: 'hard' },
  ],
  'general-va': [
    { id: 'gva-p1', text: "Hi there, I'm your virtual assistant and I'll be helping you manage your daily tasks.", category: 'Client Greeting', difficulty: 'easy' },
    { id: 'gva-p2', text: "I've organized your contacts into categories and updated the spreadsheet you requested.", category: 'Task Update', difficulty: 'medium' },
    { id: 'gva-p3', text: "I've completed the research and compiled the findings into a summary document for your review.", category: 'Research Report', difficulty: 'medium' },
    { id: 'gva-p4', text: "I'll have the report ready by Wednesday morning, well ahead of your investor meeting on Friday.", category: 'Deadline Communication', difficulty: 'hard' },
    { id: 'gva-p5', text: "I've sorted through your inbox and flagged eleven messages that require your personal attention.", category: 'Email Management', difficulty: 'medium' },
    { id: 'gva-p6', text: "Please let me know if you'd like me to schedule the appointments or if you prefer to review them first.", category: 'Client Communication', difficulty: 'easy' },
  ],
  'customer-service': [
    { id: 'cs-p1', text: "Thank you for contacting customer support. My name is Jamie and I'll be happy to help you today.", category: 'Customer Greeting', difficulty: 'easy' },
    { id: 'cs-p2', text: "I completely understand your frustration and I want to make this right for you.", category: 'Empathy Statement', difficulty: 'medium' },
    { id: 'cs-p3', text: "I've looked up your account and I can see exactly what happened with your order.", category: 'Account Review', difficulty: 'medium' },
    { id: 'cs-p4', text: "I'm going to process a full refund and ship a replacement to you with overnight delivery at no charge.", category: 'Resolution Script', difficulty: 'hard' },
    { id: 'cs-p5', text: "Is there anything else I can help you with today? I want to make sure you're fully taken care of.", category: 'Closing Script', difficulty: 'easy' },
    { id: 'cs-p6', text: "I apologize for the inconvenience and I appreciate your patience while we resolve this matter.", category: 'De-escalation Script', difficulty: 'medium' },
  ],
  'receptionist': [
    { id: 'rec-p1', text: "Good morning, thank you for calling Riverside Medical Group. How may I help you?", category: 'Phone Greeting', difficulty: 'easy' },
    { id: 'rec-p2', text: "Dr. Reynolds is with a patient right now, but I can take a message and have her return your call.", category: 'Call Routing', difficulty: 'medium' },
    { id: 'rec-p3', text: "Your appointment is confirmed for Thursday at two-thirty. Please arrive fifteen minutes early.", category: 'Appointment Confirmation', difficulty: 'medium' },
    { id: 'rec-p4', text: "I'll transfer you to the billing department. Please hold for just one moment.", category: 'Call Transfer', difficulty: 'easy' },
    { id: 'rec-p5', text: "We have a conference room available on the third floor that seats up to twelve people.", category: 'Facility Management', difficulty: 'medium' },
    { id: 'rec-p6', text: "I've notified the team that you've arrived. Someone will be down to greet you shortly.", category: 'Visitor Management', difficulty: 'easy' },
  ],
  'technical-support': [
    { id: 'ts-p1', text: "Thank you for calling technical support. Can you describe the issue you're experiencing?", category: 'Support Greeting', difficulty: 'easy' },
    { id: 'ts-p2', text: "Let's try restarting your router by unplugging it for thirty seconds and then plugging it back in.", category: 'Troubleshooting Steps', difficulty: 'medium' },
    { id: 'ts-p3', text: "The error code you're seeing indicates a driver conflict that we can resolve with a simple update.", category: 'Error Explanation', difficulty: 'hard' },
    { id: 'ts-p4', text: "I'm going to walk you through this step by step, so please let me know if anything is unclear.", category: 'Guided Support', difficulty: 'medium' },
    { id: 'ts-p5', text: "Your system should now be functioning properly. Is there anything else I can assist with?", category: 'Resolution Confirmation', difficulty: 'easy' },
    { id: 'ts-p6', text: "I'll escalate this to our Tier 2 team who can investigate the underlying network configuration.", category: 'Escalation Script', difficulty: 'hard' },
  ],
  'medical-va': [
    { id: 'mva-p1', text: "Thank you for calling Dr. Patel's office. How may I assist you today?", category: 'Patient Greeting', difficulty: 'easy' },
    { id: 'mva-p2', text: "I need to verify your insurance information before we can schedule your appointment.", category: 'Insurance Verification', difficulty: 'medium' },
    { id: 'mva-p3', text: "Your copay for this visit will be thirty dollars, due at the time of service.", category: 'Billing Communication', difficulty: 'medium' },
    { id: 'mva-p4', text: "I'm unable to discuss specific medical results without proper patient verification and authorization.", category: 'HIPAA Compliance', difficulty: 'hard' },
    { id: 'mva-p5', text: "The prior authorization for your MRI has been approved and is valid for the next thirty days.", category: 'Authorization Update', difficulty: 'hard' },
    { id: 'mva-p6', text: "Please arrive twenty minutes early to complete your new patient registration paperwork.", category: 'Patient Instructions', difficulty: 'medium' },
  ],
  'real-estate-va': [
    { id: 'rva-p1', text: "Thank you for your interest in the property. I'd be happy to schedule a showing for you.", category: 'Client Greeting', difficulty: 'easy' },
    { id: 'rva-p2', text: "The sellers have accepted your offer of four hundred and twenty thousand dollars, contingent on inspection.", category: 'Offer Communication', difficulty: 'hard' },
    { id: 'rva-p3', text: "The property is listed at three hundred eighty-nine thousand and has been on the market for ninety days.", category: 'Listing Details', difficulty: 'medium' },
    { id: 'rva-p4', text: "I've scheduled the open house for Saturday from eleven to one and updated all the listing platforms.", category: 'Coordination Script', difficulty: 'medium' },
    { id: 'rva-p5', text: "Your pre-approval letter needs to be updated before we can submit the formal offer.", category: 'Buyer Qualification', difficulty: 'medium' },
    { id: 'rva-p6', text: "The closing is scheduled for next Friday and the title company has received all the necessary documents.", category: 'Transaction Management', difficulty: 'hard' },
  ],
  'ecommerce-va': [
    { id: 'eva-p1', text: "Thank you for shopping with us. I'm here to help with your order.", category: 'Customer Greeting', difficulty: 'easy' },
    { id: 'eva-p2', text: "I've located your order and it looks like it's currently in transit with an expected delivery on Friday.", category: 'Order Status', difficulty: 'medium' },
    { id: 'eva-p3', text: "I can process a full refund for the incorrect item and send the right size with expedited shipping.", category: 'Return Processing', difficulty: 'medium' },
    { id: 'eva-p4', text: "The return window has closed but I've made an exception since the item is still unworn with tags attached.", category: 'Exception Handling', difficulty: 'hard' },
    { id: 'eva-p5', text: "I've updated the product listings across all platforms and adjusted the inventory counts accordingly.", category: 'Listing Management', difficulty: 'medium' },
    { id: 'eva-p6', text: "Your chargeback dispute has been submitted and you should see the credit within five business days.", category: 'Dispute Resolution', difficulty: 'hard' },
  ],
  'social-media-va': [
    { id: 'smva-p1', text: "I've scheduled your posts across Instagram, Facebook, and Twitter for the product launch on Tuesday.", category: 'Content Scheduling', difficulty: 'medium' },
    { id: 'smva-p2', text: "The engagement rate on your latest post increased by twenty-three percent after adjusting the hashtag strategy.", category: 'Analytics Report', difficulty: 'hard' },
    { id: 'smva-p3', text: "I'd recommend responding to the negative comment with empathy and offering to resolve the issue privately.", category: 'Crisis Management', difficulty: 'medium' },
    { id: 'smva-p4', text: "Your follower count has grown by four hundred this week, largely from the Reel we posted on Thursday.", category: 'Growth Update', difficulty: 'medium' },
    { id: 'smva-p5', text: "I've created a content calendar for the next month with three posts per week across all platforms.", category: 'Content Planning', difficulty: 'easy' },
    { id: 'smva-p6', text: "The brand voice should be consistent across all channels — warm, professional, and approachable.", category: 'Brand Strategy', difficulty: 'hard' },
  ],
  'bookkeeper': [
    { id: 'bk-p1', text: "I've reconciled your bank statements and there are three transactions that need your review.", category: 'Reconciliation Report', difficulty: 'medium' },
    { id: 'bk-p2', text: "Your profit and loss statement shows a twelve percent increase in revenue compared to last quarter.", category: 'Financial Report', difficulty: 'hard' },
    { id: 'bk-p3', text: "I need the receipts for the twenty-four hundred dollar office supplies transaction to categorize it properly.", category: 'Expense Verification', difficulty: 'medium' },
    { id: 'bk-p4', text: "I've organized your receipts by category and flagged the ones that may qualify as deductible expenses.", category: 'Tax Preparation', difficulty: 'hard' },
    { id: 'bk-p5', text: "Your accounts receivable shows four outstanding invoices totaling eight thousand two hundred dollars.", category: 'AR Report', difficulty: 'medium' },
    { id: 'bk-p6', text: "I cannot categorize personal expenses as business deductions — that would be a compliance issue.", category: 'Professional Boundary', difficulty: 'hard' },
  ],
  'data-entry': [
    { id: 'de-p1', text: "I've entered all five hundred records into the CRM and verified the formatting is consistent.", category: 'Task Completion', difficulty: 'medium' },
    { id: 'de-p2', text: "I found twenty-five records with incorrect phone numbers out of the two hundred that were entered.", category: 'Quality Report', difficulty: 'medium' },
    { id: 'de-p3', text: "The data migration is complete and all custom fields have been mapped to the new system.", category: 'Migration Update', difficulty: 'hard' },
    { id: 'de-p4', text: "I've double-checked every entry against the original source and corrected all discrepancies.", category: 'Verification Report', difficulty: 'medium' },
    { id: 'de-p5', text: "The spreadsheet has been formatted with separate tabs for each of the four industry categories.", category: 'Organization Report', difficulty: 'easy' },
    { id: 'de-p6', text: "I've flagged the records with missing email addresses for your review before the campaign launches.", category: 'Data Quality Alert', difficulty: 'medium' },
  ],
};

// ─── Reading Aloud ──────────────────────────────────────────

export interface ReadingItem {
  id: string;
  title: string;
  text: string;
}

type ReadingBank = Record<PositionId, ReadingItem[]>;

export const POSITION_READING: ReadingBank = {
  'insurance-csr': [
    { id: 'icsr-r1', title: 'Welcome Message', text: "Good morning, and thank you for choosing Global Insurance. My name is Alex, and I'll be your dedicated account specialist. Our company has been providing reliable coverage to families across the country for over thirty years. I'm here to answer any questions you may have and to make sure you get the most out of your policy." },
    { id: 'icsr-r2', title: 'Claims Process', text: "Filing a claim with us is straightforward. First, you'll want to gather any relevant documentation, including photos, receipts, and a written description of the incident. Once you have those ready, you can submit your claim online through our portal, or you can call our claims department directly." },
    { id: 'icsr-r3', title: 'Policy Renewal', text: "Your policy is set to renew automatically on the first of next month. We'll send you a renewal notice by email and mail at least thirty days in advance, outlining any changes to your coverage or premium. If you'd like to make adjustments before the renewal date, now is the perfect time." },
  ],
  'insurance-sales': [
    { id: 'isales-r1', title: 'Sales Pitch Opening', text: "Good morning, Mr. Davis. This is Sarah from Summit Insurance. I noticed you've been a loyal customer for five years now, and I wanted to reach out personally to make sure you're getting the best value. We've recently introduced a new bundling program that could save you up to twenty percent on your monthly premium." },
    { id: 'isales-r2', title: 'Value Presentation', text: "What sets our coverage apart is the personalized support you receive. Unlike online-only providers, when you call us, you speak to a real person who knows your policy. Our claims satisfaction rate is ninety-six percent, and our average response time is under four minutes." },
    { id: 'isales-r3', title: 'Closing Script', text: "Based on what you've told me, I can prepare a custom quote that includes full coverage with a five-hundred-dollar deductible, roadside assistance, and rental reimbursement. The total would come to one hundred twelve dollars per month — that's seventeen dollars less than what you're paying now. Shall I go ahead and set that up?" },
  ],
  'cold-caller': [
    { id: 'cc-r1', title: 'Cold Call Opening', text: "Hi, this is Jordan from Streamline Solutions. I know you weren't expecting my call, so I'll be brief. We help businesses like yours reduce operational costs by automating routine tasks. I'm not asking you to buy anything today — I'd just like thirty seconds to explain why I'm calling." },
    { id: 'cc-r2', title: 'Value Proposition', text: "Companies using our platform report saving an average of fifteen hours per week on administrative work. That's time your team can spend on revenue-generating activities instead. We integrate with the tools you already use, so there's no learning curve or disruption to your workflow." },
    { id: 'cc-r3', title: 'Voicemail Script', text: "Hi, this message is for Ms. Jennifer Torres. My name is Jordan, I'm calling from Streamline Solutions. I tried reaching you earlier about a brief demonstration of our platform. I'll be available tomorrow between ten and noon if you'd like to call back at your convenience. Thank you and have a great day." },
  ],
  'sdr': [
    { id: 'sdr-r1', title: 'Personalized Cold Open', text: "Hi, this is Alex from Northpeak. I know you weren't expecting my call, so I'll be quick. I saw your team just opened two new offices, and usually when companies grow that fast, sales reps end up buried in unqualified leads. I'm not here to pitch you today — I'd just like to ask a couple of questions to see if a short call next week even makes sense." },
    { id: 'sdr-r2', title: 'Discovery and Qualification', text: "Before I suggest anything, I want to make sure this is actually relevant to you. Roughly how many reps are on your team right now, and what tools are they using to manage their pipeline? And when you think about the biggest thing slowing your team down, is it finding leads, qualifying them, or getting meetings booked? Your answers will tell me whether a conversation is even worth your time." },
    { id: 'sdr-r3', title: 'Booking and Confirming the Meeting', text: "Based on what you've told me, I think a twenty-minute call with one of our specialists would be genuinely useful. I have Tuesday at two or Wednesday at ten. I'll send a calendar invite right after we hang up so it's locked in, and I'll drop you a short reminder the morning of. If anything comes up, just reply to the invite and we'll find another time." },
  ],
  'appointment-setter': [
    { id: 'as-r1', title: 'Scheduling Call', text: "Hello, I'm calling to schedule your complimentary consultation with one of our financial advisors. We have availability this Tuesday at two in the afternoon or Thursday at four. The consultation takes about thirty minutes and can be done over the phone or via video call, whichever you prefer." },
    { id: 'as-r2', title: 'Confirmation Script', text: "I've got you scheduled for Thursday at four with Mr. Patterson. I'll send a calendar invitation to your email with all the details, including a video link and a brief questionnaire to fill out beforehand. If you need to reschedule, just give us a call twenty-four hours in advance." },
    { id: 'as-r3', title: 'No-Show Follow-up', text: "Hi, I noticed we missed connecting on Thursday. I completely understand that things come up. I have a few more openings next week — would Wednesday morning at ten or Friday afternoon at two work better for you? I want to make sure we find a time that fits your schedule." },
  ],
  'executive-assistant': [
    { id: 'ea-r1', title: 'Professional Greeting', text: "Good morning, Mr. Thompson's office. This is Sarah speaking. How may I assist you today? Mr. Thompson is currently in a meeting, but I'd be happy to take a detailed message or help you with anything else you may need." },
    { id: 'ea-r2', title: 'Schedule Coordination', text: "I've reviewed the executive's calendar for next week. On Monday, you have the strategy meeting at nine, followed by a lunch with the board chair at noon. Tuesday is open until three, when you have the quarterly review. I've blocked Wednesday morning for prep time." },
    { id: 'ea-r3', title: 'Travel Arrangement', text: "I've booked your flight to Chicago departing at six-forty-five on Tuesday morning. The car service will pick you up at four-thirty from your home. Your hotel reservation is confirmed at the Marriott downtown, and I've forwarded the itinerary to your email." },
  ],
  'general-va': [
    { id: 'gva-r1', title: 'Client Onboarding', text: "Welcome aboard! I'm excited to be working with you. I've already started organizing your inbox and I've flagged the messages that need your attention. I've also created a shared calendar so you can see my availability and assign tasks directly." },
    { id: 'gva-r2', title: 'Task Update', text: "I've completed the competitor research you requested. I've organized the findings into a spreadsheet with columns for pricing, services offered, and customer reviews. The summary document is in your shared folder, and I've highlighted three competitors that are worth watching closely." },
    { id: 'gva-r3', title: 'Priority Management', text: "I know you mentioned the report was due Friday, but I've prioritized it and I'll have a draft ready for your review by Wednesday morning. That gives you two full days to review and request changes before your investor meeting. Let me know if you'd like me to adjust anything." },
  ],
  'customer-service': [
    { id: 'cs-r1', title: 'Customer Greeting', text: "Thank you for calling customer support. My name is Jamie and I'll be your representative today. I want you to know that I'm here to help, and I'll do everything I can to resolve your issue. Could you please start by telling me your order number so I can pull up your account?" },
    { id: 'cs-r2', title: 'De-escalation Script', text: "I completely understand why you're frustrated, and I apologize that this has happened. I want to make this right for you. I've located your order and I can see exactly what went wrong. I'm going to personally make sure this gets resolved today, not in three to five business days." },
    { id: 'cs-r3', title: 'Resolution Script', text: "Here's what I'm going to do for you. I'm processing a full refund of one hundred twenty dollars back to your original payment method. I'm also shipping a replacement with overnight delivery at no charge to you. You should receive both within twenty-four hours. Is there anything else I can help you with?" },
  ],
  'receptionist': [
    { id: 'rec-r1', title: 'Phone Greeting', text: "Good morning, thank you for calling Riverside Medical Group. This is Maria speaking. How may I help you today? If you're calling to schedule an appointment, I can connect you with our scheduling team. For billing questions, I'll transfer you to our billing department." },
    { id: 'rec-r2', title: 'Visitor Management', text: "Welcome to Riverside Medical Group. I see you're here for your two o'clock appointment with Dr. Reynolds. Since you're a new patient, I'll need you to fill out these registration forms. It should take about ten minutes, and I'll let the doctor know you've arrived." },
    { id: 'rec-r3', title: 'Call Routing', text: "I'm sorry, Dr. Reynolds is currently with a patient and can't come to the phone. I'd be happy to take a detailed message and have her return your call as soon as she's available. She has openings at three-thirty and four-fifteen this afternoon — would either of those work?" },
  ],
  'technical-support': [
    { id: 'ts-r1', title: 'Support Greeting', text: "Thank you for calling technical support. My name is Chris and I'll be helping you today. Before we begin, I'll need to verify a few details. Can you please confirm your account number and the device you're experiencing issues with? I want to make sure we resolve this as quickly as possible." },
    { id: 'ts-r2', title: 'Troubleshooting Steps', text: "Let's try a few things. First, I'd like you to restart your router by unplugging it from the power outlet, waiting thirty seconds, and then plugging it back in. While that's restarting, let's also check your network settings on your computer to make sure everything is configured correctly." },
    { id: 'ts-r3', title: 'Resolution Confirmation', text: "Your internet connection should now be working properly. I can see from my end that your router is online and all the lights are green. Before we end this call, I want to make sure you're fully satisfied. Is there anything else I can assist you with today?" },
  ],
  'medical-va': [
    { id: 'mva-r1', title: 'Patient Greeting', text: "Thank you for calling Dr. Patel's office. This is Maria speaking. How may I assist you today? If you need to schedule an appointment, I'll need your full name and date of birth to pull up your patient record first." },
    { id: 'mva-r2', title: 'Insurance Verification', text: "I'm calling to let you know that your insurance has been verified and your visit is covered under your plan. Your copay will be thirty dollars, due at the time of service. I've also confirmed that your referral from Dr. Nguyen has been received and is on file." },
    { id: 'mva-r3', title: 'HIPAA Compliance', text: "I understand you're calling about your mother's test results. For me to discuss any medical information, I'll need to verify that your mother has signed an authorization form listing you as an approved contact. Without that authorization on file, I'm unable to share specific results, but I can take a message for the doctor." },
  ],
  'real-estate-va': [
    { id: 'rva-r1', title: 'Buyer Qualification', text: "Thank you for your interest in the Maple Street property. I'd be happy to schedule a showing for you. Before we do that, I'll need to confirm a few details. Are you currently working with a buyer's agent, and do you have a pre-approval letter from a lender? That will help us move quickly if you decide to make an offer." },
    { id: 'rva-r2', title: 'Listing Update', text: "I wanted to give you an update on your listing. We've had three showings this week and one formal offer at three hundred eighty thousand. The feedback has been positive overall, though two buyers mentioned the kitchen could use updating. I recommend we respond to the offer by tomorrow and keep the other showings as backup." },
    { id: 'rva-r3', title: 'Closing Coordination', text: "The closing is scheduled for next Friday at ten in the morning at the title company's office. I've confirmed with the lender that your loan is fully approved and the appraisal came back at the purchase price. The seller has signed all disclosures and the only remaining item is your final walk-through, which I've scheduled for Thursday afternoon." },
  ],
  'ecommerce-va': [
    { id: 'eva-r1', title: 'Order Status Update', text: "Thank you for reaching out about your order. I've located it in our system — order number EC-88210 for a blender that was shipped on the fourteenth. I can see that the tracking hasn't updated in six days, which is unusual. I'm going to contact the carrier right now and request a trace on the package." },
    { id: 'eva-r2', title: 'Return Processing', text: "I understand you received the wrong size. I apologize for the error — it looks like a fulfillment mistake on our end. I'm processing a return label for the incorrect item at no cost to you, and I'm sending the correct size with overnight shipping so you have it before your event this weekend." },
    { id: 'eva-r3', title: 'Inventory Management', text: "I've updated all product listings across our three platforms and reconciled the inventory counts. There were four discrepancies between the warehouse system and the online stores, which I've corrected. I've also set up low-stock alerts so we're notified when any item drops below ten units." },
  ],
  'social-media-va': [
    { id: 'smva-r1', title: 'Content Strategy', text: "I've created a content calendar for the next four weeks with three posts per week across Instagram, Facebook, and Twitter. The strategy focuses on behind-the-scenes content on Mondays, product highlights on Wednesdays, and customer testimonials on Fridays. I've also included two Reels and a Story sequence for the product launch on Tuesday." },
    { id: 'smva-r2', title: 'Crisis Response', text: "I've been monitoring the comments on your latest post and I noticed the negative comment has gained traction. I recommend we respond publicly with empathy, acknowledging the concern and inviting the customer to continue the conversation privately. This shows other followers that we care, without escalating the situation in public." },
    { id: 'smva-r3', title: 'Analytics Report', text: "Here's your weekly report. Your follower count grew by four hundred this week, driven largely by the Reel we posted on Thursday. Engagement rate is up twenty-three percent and our top-performing post reached twelve thousand accounts. I recommend we double down on Reels and reduce text-only posts next week." },
  ],
  'bookkeeper': [
    { id: 'bk-r1', title: 'Monthly Report', text: "I've completed your monthly financial report. Revenue for October was forty-two thousand dollars, up eight percent from September. Your largest expense category was payroll at eighteen thousand, followed by rent at four thousand five hundred. I've flagged one transaction for twenty-four hundred in office supplies that seems unusually high and may need your review." },
    { id: 'bk-r2', title: 'Reconciliation Summary', text: "I've reconciled all bank and credit card statements for the third quarter. All transactions match except for three items totaling six hundred dollars that appear to be duplicate charges. I've contacted the bank to dispute these and expect a credit within five business days. Everything else is clean and ready for your review." },
    { id: 'bk-r3', title: 'Tax Preparation', text: "I've organized all receipts by category for your tax preparation. I've separated business expenses from personal ones and flagged the ones that may qualify as deductions. I noticed three receipts for meals that I've categorized as business entertainment, but I'll need you to confirm the business purpose for each." },
  ],
  'data-entry': [
    { id: 'de-r1', title: 'Task Completion Report', text: "I've entered all five hundred customer records into the CRM as requested. The key fields — name, email, phone, company, and industry — have been completed for every record. Missing phone numbers have been marked as N/A and inconsistent email formats have been standardized. The entire spreadsheet is ready for your review." },
    { id: 'de-r2', title: 'Quality Assurance', text: "I've completed a full quality check on the data entered last week. Out of two hundred records, I found twenty-five with incorrect phone numbers and eight with misspelled company names. I've corrected all errors and cross-referenced every entry against the original source documents." },
    { id: 'de-r3', title: 'Migration Summary', text: "The data migration from the old system is complete. All two thousand product records have been transferred with their custom fields properly mapped. I've verified the data integrity by running a comparison report and everything matches. The new database is ready to go live." },
  ],
};

// ─── Note Taking ────────────────────────────────────────────

export interface NoteTakingItem {
  id: string;
  title: string;
  callerName: string;
  callerCompany: string;
  audioScript: string;
  keyPoints: string[];
}

type NoteTakingBank = Record<PositionId, NoteTakingItem[]>;

export const POSITION_NOTE_TAKING: NoteTakingBank = {
  'insurance-csr': [
    {
      id: 'icsr-n1', title: 'Policy Update Call', callerName: 'Jamie', callerCompany: 'Summit Insurance',
      audioScript: "Hi, this is Jamie from Summit Insurance calling about your homeowner's policy. We're updating our records and I wanted to confirm a few details. Your current coverage limit is four hundred fifty thousand dollars with a one thousand dollar deductible. Your policy renews on March 15th, and your new annual premium will be one thousand two hundred eighty dollars, which is a slight increase of forty-five dollars from last year. You're currently eligible for a loyalty discount of twelve percent since you've been with us for over five years.",
      keyPoints: ['coverage limit $450,000', 'deductible $1,000', 'renewal date March 15th', 'annual premium $1,280', 'increase of $45', 'loyalty discount 12%', 'five years with company'],
    },
    {
      id: 'icsr-n2', title: 'Accident Report', callerName: 'Robert Martinez', callerCompany: 'Statewide Mutual',
      audioScript: "I'm calling to report an accident that happened yesterday at approximately 3:45 PM at the intersection of Main Street and Oak Avenue. I was driving north on Main when a vehicle ran a red light and hit the front passenger side of my car. The other driver's name is Robert Martinez, license plate number 7-ABC-421, and his insurance provider is Statewide Mutual, policy number SM-88210. There were no injuries, but my car will need significant body work. A police report was filed, report number 2024-1156.",
      keyPoints: ['accident at 3:45 PM', 'Main Street and Oak Avenue', 'driving north on Main', 'other driver ran red light', 'front passenger side hit', 'other driver Robert Martinez', 'license plate 7-ABC-421', 'Statewide Mutual insurance', 'policy SM-88210', 'no injuries', 'police report 2024-1156'],
    },
    {
      id: 'icsr-n3', title: 'New Customer Onboarding', callerName: 'Alex', callerCompany: 'Global Insurance',
      audioScript: "Welcome to the family! I've set up your new auto insurance policy, effective Monday, December 2nd. Your policy number is GL-99284. You've chosen the full coverage plan with a five hundred dollar deductible and your monthly premium is one hundred forty-two dollars. I've also enrolled you in our paperless billing program, so you'll receive your statements via email. Your first payment is due on December 10th, and after that, your billing cycle will be the 10th of every month.",
      keyPoints: ['effective December 2nd', 'policy number GL-99284', 'full coverage plan', '$500 deductible', 'monthly premium $142', 'paperless billing', 'statements via email', 'first payment December 10th', 'billing cycle 10th of every month'],
    },
  ],
  'insurance-sales': [
    {
      id: 'isales-n1', title: 'Quote Request', callerName: 'Maria Santos', callerCompany: 'Coastal Insurance',
      audioScript: "I'm calling to get a quote for auto insurance. I currently pay eighty-nine dollars a month with Geico. I have a clean driving record, I'm thirty-four years old, and I drive about twelve thousand miles a year. I'm also interested in bundling with a renters policy if the discount is worth it. My vehicle is a 2021 Toyota Camry and I live in Austin, Texas.",
      keyPoints: ['current premium $89/month with Geico', 'clean driving record', 'age 34', '12,000 miles/year', 'interested in bundling renters', 'vehicle 2021 Toyota Camry', 'lives in Austin Texas'],
    },
    {
      id: 'isales-n2', title: 'Referral Call', callerName: 'John Davis', callerCompany: 'Summit Insurance',
      audioScript: "My friend recommended your company. I just bought a new home for three hundred eighty-five thousand dollars and I'm wondering about bundling with my auto policy. I currently pay one hundred forty-two dollars a month for auto. Do you offer any discounts for having a security system installed? My phone number is 555-0187 and my email is john dot davis at gmail dot com.",
      keyPoints: ['referred by friend', 'new home $385,000', 'current auto premium $142/month', 'asking about security system discount', 'phone 555-0187', 'email john.davis@gmail.com'],
    },
    {
      id: 'isales-n3', title: 'Competitor Switch', callerName: 'Linda Park', callerCompany: 'Global Insurance',
      audioScript: "I've been with State Farm for fifteen years and I pay one hundred fifteen dollars a month for full coverage on a 2019 Toyota Camry. I've never had a claim and I have a perfect driving record. I'd like to see if you can beat that rate. My policy number with State Farm is SF-77421 and it expires on November 30th.",
      keyPoints: ['15 years with State Farm', 'current premium $115/month', 'full coverage', '2019 Toyota Camry', 'no claims', 'perfect driving record', 'State Farm policy SF-77421', 'expires November 30th'],
    },
  ],
  'cold-caller': [
    {
      id: 'cc-n1', title: 'Prospect Qualification', callerName: 'Jennifer Torres', callerCompany: 'Streamline Solutions',
      audioScript: "This is Jennifer Torres, I'm the office manager at Coastal Realty. We have about twenty agents and we're currently using a competitor's CRM. I'm not the decision maker but I can put you in touch with our owner, Mark Johnson. He's usually available Tuesday and Thursday mornings. Our main pain point is that the current system is too slow and doesn't integrate with our email.",
      keyPoints: ['contact: Jennifer Torres', 'title: office manager', 'company: Coastal Realty', '20 agents', 'uses competitor CRM', 'decision maker: Mark Johnson', 'available Tue/Thu mornings', 'pain point: slow system, no email integration'],
    },
    {
      id: 'cc-n2', title: 'Gatekeeper Screening', callerName: 'Sarah', callerCompany: 'Johnson Manufacturing',
      audioScript: "I'm the office manager here at Johnson Manufacturing. Mr. Johnson is in a meeting until three o'clock and can't be disturbed. I can take a message and he'll get back to you. What company are you with and what is this regarding? He gets a lot of calls so I need to screen them. If it's important, I'll make sure he calls you back today.",
      keyPoints: ['gatekeeper: Sarah', 'company: Johnson Manufacturing', 'Mr. Johnson in meeting until 3 PM', 'need to leave message', 'must state company and purpose', 'callback possible today'],
    },
    {
      id: 'cc-n3', title: 'Objection Handling', callerName: 'David Kim', callerCompany: 'Streamline Solutions',
      audioScript: "Look, we already have a vendor for that and we've been with them for three years. They do a fine job. We have a contract anyway, so even if I wanted to switch, I couldn't for another eight months. I don't see the point in this call. Unless you can show me significant savings, there's really nothing to discuss.",
      keyPoints: ['has current vendor', '3 years with them', 'happy with service', 'contract for 8 more months', 'needs significant savings to consider', 'not interested unless clear value'],
    },
  ],
  'sdr': [
    {
      id: 'sdr-n1', title: 'Discovery Call Notes', callerName: 'Priya Natarajan', callerCompany: 'Brightline Media',
      audioScript: "Sure, I can give you a couple of minutes. We're a team of about thirty-five, growing fast. We use Salesforce for our CRM and Outreach for sequencing. Honestly our biggest issue is that our reps spend way too long on leads that never convert — I'd guess forty percent of their time is wasted. I own the tooling budget, but any new spend over ten thousand needs sign-off from our VP of Sales, Daniel Cruz. I could do a call next Thursday afternoon.",
      keyPoints: ['contact: Priya Natarajan', 'company: Brightline Media', '~35 reps, growing fast', 'CRM: Salesforce', 'sequencing: Outreach', 'pain: ~40% of rep time on bad leads', 'owns tooling budget', 'spend over $10k needs VP Daniel Cruz sign-off', 'available Thursday afternoon'],
    },
    {
      id: 'sdr-n2', title: 'Qualification Call Notes', callerName: 'Marcus Bell', callerCompany: 'Vantage Logistics',
      audioScript: "We're evaluating a few options this quarter. Budget is set — around twenty-five thousand for the year. The decision will be made by me and our RevOps lead, Sofia. Timeline is important: we want something in place before our fiscal year starts in April. What matters most to us is integration with HubSpot and good reporting. If your tool checks those boxes, send me a proposal and let's book a demo for the week of the fifteenth.",
      keyPoints: ['contact: Marcus Bell', 'company: Vantage Logistics', 'budget: ~$25k/year, approved', 'decision makers: Marcus + RevOps lead Sofia', 'timeline: live before April fiscal year', 'must integrate with HubSpot', 'needs strong reporting', 'wants demo week of the 15th'],
    },
    {
      id: 'sdr-n3', title: 'Gatekeeper Notes', callerName: 'Renee', callerCompany: 'Halcyon Health',
      audioScript: "This is Renee, I handle the front desk. Our VP of Sales, Mr. Osei, is traveling until Wednesday. He does look at his messages though. If you email me a short summary and who you are, I'll flag it for him. The best window to catch him by phone is early morning, before nine, Eastern time. And just so you know, he prefers a quick call over a long email, so keep whatever you send brief.",
      keyPoints: ['gatekeeper: Renee, front desk', 'company: Halcyon Health', 'decision maker: VP Mr. Osei', 'traveling until Wednesday', 'email a short summary to Renee', 'best phone window: before 9 AM Eastern', 'prefers a quick call over long email'],
    },
  ],
  'appointment-setter': [
    {
      id: 'as-n1', title: 'Scheduling Call', callerName: 'Patricia Lee', callerCompany: 'Summit Financial',
      audioScript: "Sure, I'd be happy to set up a time to talk. I work during the day, so it would have to be in the evening or on the weekend. I'm available Tuesday and Thursday evenings between six and eight PM, or any time on Saturday. I prefer mornings on Saturday, say between nine and eleven. My phone number is 555-0187, extension 42.",
      keyPoints: ['available evenings and weekends', 'Tuesday/Thursday 6-8 PM', 'Saturday mornings 9-11 AM', 'phone 555-0187 ext 42', 'works during the day'],
    },
    {
      id: 'as-n2', title: 'Rescheduling', callerName: 'Tom Bradley', callerCompany: 'Coastal Consulting',
      audioScript: "I said I'd call back but honestly I've been really busy. Can we push this to next week? I have a big presentation on Friday and I need to prepare. Maybe Wednesday or Thursday next week would work. Morning would be better, around ten or eleven. My calendar is pretty packed in the afternoons so mornings are best.",
      keyPoints: ['needs to reschedule to next week', 'big presentation Friday', 'prefers Wed or Thu next week', 'morning around 10 or 11', 'afternoons are booked'],
    },
    {
      id: 'as-n3', title: 'Confirmation Call', callerName: 'Maria Santos', callerCompany: 'Global Insurance',
      audioScript: "Hi Maria, this is a confirmation call for your appointment with Dr. Reynolds on Thursday, November 14th at two-thirty PM. Please arrive fifteen minutes early to complete your updated paperwork. If you need to reschedule, kindly call us at least twenty-four hours in advance. Our office number is 555-0182. We look forward to seeing you.",
      keyPoints: ['appointment Thursday November 14th', 'time 2:30 PM', 'arrive 15 minutes early', 'reschedule 24 hours in advance', 'office number 555-0182'],
    },
  ],
  'executive-assistant': [
    {
      id: 'ea-n1', title: 'Complex Rescheduling', callerName: 'Sarah', callerCompany: "CEO's Office",
      audioScript: "Hi, this is Sarah from the CEO's office. Mark needs to move the two PM strategy meeting to three-thirty PM tomorrow. Also, he wants to add a fifteen-minute prep call with the CFO beforehand at three-ten PM. Can you update the calendar and notify all the attendees? There are six people on the invite list. The meeting room should be changed to Conference Room B.",
      keyPoints: ['move 2 PM meeting to 3:30 PM', 'add 15-min prep call at 3:10 PM', 'prep call with CFO', 'notify 6 attendees', 'room change to Conference Room B'],
    },
    {
      id: 'ea-n2', title: 'Cross-Timezone Meeting', callerName: 'James Wright', callerCompany: 'London Office',
      audioScript: "I'm calling from the London office. Our managing director needs to speak with your executive sometime this week. She's available Tuesday or Wednesday between nine AM and noon GMT. That would be four AM to seven AM your time, Eastern. Or if your executive can do early morning, we could also do Thursday at eight AM GMT, which is five AM your time.",
      keyPoints: ['London office calling', 'available Tue/Wed 9 AM-noon GMT', 'converts to 4-7 AM Eastern', 'alternative: Thursday 8 AM GMT', 'converts to 5 AM Eastern'],
    },
    {
      id: 'ea-n3', title: 'Travel Itinerary', callerName: 'Delta Airlines', callerCompany: 'Delta',
      audioScript: "Your flight to Chicago has been confirmed. You depart Tuesday at six-forty-five AM from gate B12, terminal two. Your confirmation code is DLX-4471. The return flight is Friday at seven-fifteen PM, arriving at ten-forty PM local time. Your hotel is the Marriott downtown, confirmation number M-88210, and a car service will pick you up at four-thirty AM from your home address.",
      keyPoints: ['depart Tuesday 6:45 AM', 'gate B12 terminal 2', 'confirmation DLX-4471', 'return Friday 7:15 PM', 'arrives 10:40 PM', 'hotel Marriott downtown', 'hotel confirmation M-88210', 'car service at 4:30 AM'],
    },
  ],
  'general-va': [
    {
      id: 'gva-n1', title: 'New Client Onboarding', callerName: 'David Chen', callerCompany: 'Chen Marketing Agency',
      audioScript: "Hi, I need someone to help me manage my inbox, schedule some appointments, and do some light research on competitors. I run a small marketing agency and I'm getting overwhelmed. I have about two hundred emails a day and I can't keep up. Can you start next week? I'd need you for about fifteen hours a week to start. My budget is around five hundred dollars a month.",
      keyPoints: ['needs inbox management', 'schedule appointments', 'competitor research', 'small marketing agency', '200 emails/day', 'start next week', '15 hours/week', 'budget $500/month'],
    },
    {
      id: 'gva-n2', title: 'Data Organization', callerName: 'Lisa Park', callerCompany: 'Park & Associates',
      audioScript: "I sent you a list of fifty contacts yesterday. I need them organized into a spreadsheet by industry, with notes on each one. Also, can you find their email addresses? I need this by Friday. The industries I want are healthcare, technology, finance, and retail. Put them in separate tabs in the spreadsheet. My deadline is Friday at five PM.",
      keyPoints: ['50 contacts to organize', 'organize by industry', 'find email addresses', 'due Friday 5 PM', 'industries: healthcare, tech, finance, retail', 'separate tabs in spreadsheet'],
    },
    {
      id: 'gva-n3', title: 'Deadline Change', callerName: 'Mark Johnson', callerCompany: 'Johnson Manufacturing',
      audioScript: "I know I said the report was due Friday, but my investor meeting got moved up. Can you have it ready by Wednesday morning instead? I know it's short notice. The report needs to include the Q3 revenue breakdown, the marketing spend analysis, and the customer retention metrics. I also need a one-page summary on top of the full report.",
      keyPoints: ['deadline moved from Friday to Wednesday morning', 'investor meeting moved up', 'include Q3 revenue breakdown', 'include marketing spend analysis', 'include customer retention metrics', 'need one-page summary plus full report'],
    },
  ],
  'customer-service': [
    {
      id: 'cs-n1', title: 'Missing Package', callerName: 'Jennifer Park', callerCompany: 'FastBox Delivery',
      audioScript: "I ordered a package two weeks ago and it still hasn't arrived. The tracking says it was delivered but I never got it. I've called twice already and nobody has helped me. This is the third time I'm calling! The order number is FB-77291 and it was a one hundred twenty dollar pair of shoes. I want a refund or a replacement shipped overnight. My address is 456 Oak Street, Apartment 12.",
      keyPoints: ['ordered 2 weeks ago', 'tracking says delivered', 'never received package', 'called twice before', 'order number FB-77291', 'item: $120 shoes', 'wants refund or overnight replacement', 'address: 456 Oak Street Apt 12'],
    },
    {
      id: 'cs-n2', title: 'Return Without Receipt', callerName: 'Margaret Chen', callerCompany: 'Retail Plus',
      audioScript: "I need to return this product but I lost the receipt. I bought it three weeks ago with my credit card. Can you look it up? My name is Jennifer Park. The product is a blue coffee maker, model CM-450. It stopped working after a week. I paid sixty-five dollars for it and I just want store credit at this point.",
      keyPoints: ['lost receipt', 'bought 3 weeks ago', 'paid by credit card', 'customer name: Jennifer Park', 'product: blue coffee maker', 'model CM-450', 'stopped working after a week', 'paid $65', 'wants store credit'],
    },
    {
      id: 'cs-n3', title: 'Billing Dispute', callerName: 'Robert Lee', callerCompany: 'TeleConnect',
      audioScript: "I've been a customer for five years and I've never had this problem before. My account was charged twice this month and I need it fixed today, not in three to five business days. The two charges are for eighty-nine dollars each on October 3rd and October 17th. I called last week and was told it would be fixed but it wasn't. My account number is TC-44729.",
      keyPoints: ['customer for 5 years', 'double charge this month', 'wants fix today not 3-5 days', 'charges: $89 each', 'dates: October 3rd and 17th', 'called last week unresolved', 'account number TC-44729'],
    },
  ],
  'receptionist': [
    {
      id: 'rec-n1', title: 'New Patient Check-in', callerName: 'Margaret Chen', callerCompany: 'Riverside Medical Group',
      audioScript: "Hi, I'm here for my two o'clock appointment with Dr. Reynolds. My name is Margaret Chen. I'm a new patient so I might need to fill out some paperwork. I brought my insurance card and a list of my current medications. Also, I need to update my address — I moved last month from Oak Street to Pine Avenue.",
      keyPoints: ['appointment at 2 PM', 'with Dr. Reynolds', 'new patient: Margaret Chen', 'needs paperwork', 'brought insurance card', 'brought medication list', 'address change: Oak Street to Pine Avenue'],
    },
    {
      id: 'rec-n2', title: 'Insistent Caller', callerName: 'David Kim', callerCompany: 'Kim Legal Services',
      audioScript: "I need to speak with the owner immediately. It's about a legal matter and I can't leave a message. I'll hold until they're available. I've been trying to reach them for three days and nobody has called me back. This is regarding a contract dispute for invoice number INV-4409. If I don't hear back today, I'll have my lawyer call.",
      keyPoints: ['wants to speak with owner immediately', 'legal matter', 'will not leave a message', 'trying to reach for 3 days', 'no callback received', 'contract dispute', 'invoice INV-4409', 'threatening lawyer involvement'],
    },
    {
      id: 'rec-n3', title: 'Delivery Situation', callerName: 'Tom', callerCompany: 'MedSupply Inc.',
      audioScript: "I have a delivery for Suite 400 but the receptionist up there isn't answering. I've been waiting in the lobby for fifteen minutes. The package requires a signature and I can't just leave it at the front desk. It's from MedSupply Incorporated and it's marked as temperature-controlled. What should I do? My schedule is tight and I have four more deliveries.",
      keyPoints: ['delivery for Suite 400', 'no answer from Suite 400', 'waiting 15 minutes', 'requires signature', 'from MedSupply Inc.', 'temperature-controlled package', 'cannot leave at front desk', 'has 4 more deliveries'],
    },
  ],
  'technical-support': [
    {
      id: 'ts-n1', title: 'WiFi Connectivity Issue', callerName: 'Sarah Williams', callerCompany: 'TechConnect Support',
      audioScript: "My computer won't connect to the WiFi. It was working fine this morning but now it just says no internet. I've tried restarting it twice. I work from home and I'm losing money every minute I'm offline. The router lights are all green except for the one that's blinking orange. I'm on a Windows 11 laptop and my router is a Netgear Nighthawk.",
      keyPoints: ['WiFi not connecting', 'was working this morning', 'restarted twice', 'works from home, losing money', 'router: all green except one blinking orange', 'Windows 11 laptop', 'router: Netgear Nighthawk'],
    },
    {
      id: 'ts-n2', title: 'Error Code Report', callerName: 'John Davis', callerCompany: 'TechConnect Support',
      audioScript: "I keep getting this error code 0x80070002 when I try to update. I've searched online but nothing makes sense. Can you just tell me what to do in plain English? I'm not very good with computers. I have a desktop PC that I use mostly for email and browsing. The update is for Windows, I think. It's been failing for about a week now.",
      keyPoints: ['error code 0x80070002', 'Windows update failing', 'searched online, no help', 'not technical', 'desktop PC', 'uses for email and browsing', 'failing for about a week'],
    },
    {
      id: 'ts-n3', title: 'Potential Scam Report', callerName: 'Maria Santos', callerCompany: 'TechConnect Support',
      audioScript: "I think I clicked on a bad link and now my screen is frozen with a popup saying my computer has a virus. It wants me to call a number. What should I do? I haven't called the number yet. The popup has a blue background and says Microsoft Security Alert at the top. My mouse still moves but I can't close the window. I have important files on this computer.",
      keyPoints: ['clicked bad link', 'screen frozen with popup', 'popup claims virus', 'wants to call a number', 'has NOT called the number', 'popup: blue background, Microsoft Security Alert', 'mouse still moves', 'cannot close window', 'important files on computer'],
    },
  ],
  'medical-va': [
    {
      id: 'mva-n1', title: 'Post-Surgery Scheduling', callerName: 'Maria Lopez', callerCompany: "Dr. Patel's Office",
      audioScript: "I need to schedule a follow-up with Dr. Patel. I had surgery three weeks ago and I'm still having some pain. I also need to check if my insurance covers the visit because I just switched to Blue Cross. My member ID is BCB-4471902. I'd prefer a morning appointment, preferably before ten AM. I'm available Tuesday through Friday next week.",
      keyPoints: ['schedule follow-up with Dr. Patel', 'surgery 3 weeks ago', 'still having pain', 'switched to Blue Cross insurance', 'member ID BCB-4471902', 'prefers morning before 10 AM', 'available Tue-Fri next week'],
    },
    {
      id: 'mva-n2', title: 'Billing Dispute', callerName: 'Maria Lopez', callerCompany: "Dr. Patel's Office",
      audioScript: "This is Maria Lopez calling. I received a bill for eight hundred forty dollars for my MRI but my insurance should have covered most of it. Can you explain what happened? My member ID is BCB-4471902. The MRI was done on September 12th at the imaging center on Fifth Street. I was told I would only owe a fifty dollar copay, not eight hundred forty.",
      keyPoints: ['bill: $840 for MRI', 'insurance should cover most', 'member ID BCB-4471902', 'MRI on September 12th', 'imaging center on Fifth Street', 'told copay would be $50', 'not $840'],
    },
    {
      id: 'mva-n3', title: 'Medical Records Request', callerName: 'David Chen', callerCompany: "Dr. Patel's Office",
      audioScript: "I need to get my medical records sent to a new specialist I'm seeing next week. Can you help me with that? I'll need them by Tuesday. The specialist is Dr. Nguyen at the Riverside Neurology Clinic. Her fax number is 555-0193. I also want a copy mailed to my home address for my own records.",
      keyPoints: ['needs medical records sent', 'deadline: by Tuesday', 'specialist: Dr. Nguyen', 'Riverside Neurology Clinic', 'fax: 555-0193', 'also wants copy mailed home'],
    },
  ],
  'real-estate-va': [
    {
      id: 'rva-n1', title: 'Hot Buyer Lead', callerName: 'Jennifer Torres', callerCompany: 'Coastal Realty',
      audioScript: "Hi, I saw the listing for the property on Maple Street. I'm very interested and I'd like to see it as soon as possible. I'm pre-approved for four hundred fifty thousand. Can we schedule a showing this weekend? Saturday afternoon would be ideal, around two PM. My agent is Jennifer Torres with Coastal Realty.",
      keyPoints: ['interested in Maple Street property', 'wants showing ASAP', 'pre-approved $450K', 'prefers Saturday around 2 PM', 'agent: Jennifer Torres', 'agency: Coastal Realty'],
    },
    {
      id: 'rva-n2', title: 'Frustrated Seller', callerName: 'Robert Martinez', callerCompany: 'Summit Realty',
      audioScript: "Our house has been on the market for ninety days and we've only had two showings. We're thinking about switching agents. What can you tell me about your marketing strategy? The house is listed at three hundred eighty-nine thousand and we're not willing to drop the price below three hundred seventy-five thousand. We feel like the photos don't do it justice.",
      keyPoints: ['on market 90 days', 'only 2 showings', 'considering switching agents', 'listed at $389,000', 'minimum price $375,000', 'unhappy with photos'],
    },
    {
      id: 'rva-n3', title: 'Offer Negotiation', callerName: 'Lisa Park', callerCompany: 'Coastal Realty',
      audioScript: "I submitted an offer on the Oak Lane property yesterday. The seller countered at four hundred twenty thousand. We want to accept but we need twenty-four hours to move some money around. Can you let the seller know? Our original offer was four hundred ten thousand. We can come up to four hundred fifteen thousand if they can cover the closing costs. Let me know by tomorrow morning.",
      keyPoints: ['offer on Oak Lane property', 'seller countered at $420K', 'need 24 hours to move money', 'original offer was $410K', 'can go up to $415K', 'wants seller to cover closing costs', 'deadline: tomorrow morning'],
    },
  ],
  'ecommerce-va': [
    {
      id: 'eva-n1', title: 'Lost Order Inquiry', callerName: 'Sarah Chen', callerCompany: 'ShopFast',
      audioScript: "I ordered a blender two weeks ago and the tracking hasn't updated in six days. I need it for a party this weekend. Order number is EC-88210. What's going on? The tracking says it left the warehouse in Dallas on the 14th but nothing since then. I paid sixty-four dollars for it and I need it by Saturday or I want a refund.",
      keyPoints: ['ordered blender 2 weeks ago', 'tracking not updated in 6 days', 'needed for weekend party', 'order number EC-88210', 'left Dallas warehouse on 14th', 'paid $64', 'needs by Saturday or wants refund'],
    },
    {
      id: 'eva-n2', title: 'Wrong Item Received', callerName: 'John Martinez', callerCompany: 'ShopFast',
      audioScript: "I received the wrong size shoes. I ordered a size eight but got a size ten. I need the correct size by next week for an event. How do we fix this? The order number is SH-44729. I don't want to pay for return shipping since it was your mistake. Can you send the right size with expedited shipping?",
      keyPoints: ['received wrong size shoes', 'ordered size 8, got size 10', 'needs correct size by next week', 'order number SH-44729', 'wants free return shipping', 'wants expedited shipping for replacement'],
    },
    {
      id: 'eva-n3', title: 'Late Return Request', callerName: 'Maria Santos', callerCompany: 'ShopFast',
      audioScript: "I want to return this jacket but the return window closed two days ago. I've been sick and couldn't get to it in time. Is there anything you can do? The jacket is unworn with tags still on. I paid one hundred eighty dollars for it. I can provide a doctor's note if needed. I just want store credit, not a full refund.",
      keyPoints: ['return window closed 2 days ago', 'was sick, could not return in time', 'jacket unworn with tags', 'paid $180', 'can provide doctors note', 'wants store credit not refund'],
    },
  ],
  'social-media-va': [
    {
      id: 'smva-n1', title: 'New Client Inquiry', callerName: 'Lisa Park', callerCompany: 'Park Handmade Jewelry',
      audioScript: "Hi, I'm a small business owner and I need help with my Instagram. I post maybe once a week and I'm not getting any engagement. I sell handmade jewelry and I have about eight hundred followers. Can you help me grow my account? My budget is around five hundred dollars a month. I'd like to get to five thousand followers by the end of the year.",
      keyPoints: ['small business owner', 'sells handmade jewelry', 'posts once a week', 'low engagement', 'about 800 followers', 'budget $500/month', 'goal: 5,000 followers by year end'],
    },
    {
      id: 'smva-n2', title: 'Product Launch Brief', callerName: 'David Chen', callerCompany: 'Chen Skincare',
      audioScript: "We have a product launch next Tuesday at ten AM. I need posts ready for Instagram, Facebook, and Twitter. The copy needs to be punchy and the hashtags need to be researched. Can you handle this? The product is a new line of organic skincare. I also want an Instagram Story sequence and a Reel for the launch day.",
      keyPoints: ['launch: Tuesday 10 AM', 'posts for Instagram, Facebook, Twitter', 'needs punchy copy', 'needs hashtag research', 'product: organic skincare line', 'wants Story sequence', 'wants a Reel for launch day'],
    },
    {
      id: 'smva-n3', title: 'Negative Comment Crisis', callerName: 'Sarah Williams', callerCompany: 'Williams Boutique',
      audioScript: "Someone left a really nasty comment on our latest post about our customer service. It's getting likes and other people are piling on. What should we do? The post has about two thousand likes and the negative comment has one hundred fifty likes already. We don't want to delete it and make it worse, but we also can't just ignore it.",
      keyPoints: ['nasty comment about customer service', 'gaining likes, others piling on', 'post has ~2,000 likes', 'negative comment has ~150 likes', 'afraid deleting will make it worse', 'cannot ignore it either'],
    },
  ],
  'bookkeeper': [
    {
      id: 'bk-n1', title: 'Report Discrepancy', callerName: 'Jennifer Torres', callerCompany: 'Torres Consulting',
      audioScript: "I have a question about my monthly financial report. There's a line item here for two thousand four hundred dollars that I don't recognize. It says office supplies but I didn't buy that much. Can you look into it? The date on the transaction is October 3rd. I usually spend about two hundred dollars a month on supplies. This seems way off.",
      keyPoints: ['unfamiliar line item $2,400', 'category: office supplies', 'transaction date October 3rd', 'usual monthly spend ~$200', 'seems way too high', 'needs investigation'],
    },
    {
      id: 'bk-n2', title: 'Disorganized Client', callerName: 'Mark Johnson', callerCompany: 'Johnson Manufacturing',
      audioScript: "I'm behind on three months of bookkeeping and I'm feeling overwhelmed. I have a shoebox of receipts. Can you help me get caught up before tax season? I estimate there are probably three hundred receipts in here. Some are faded and hard to read. I also have a few bank statements I haven't reconciled. I need this done by January 15th.",
      keyPoints: ['3 months behind on bookkeeping', 'shoebox of receipts', 'estimated ~300 receipts', 'some faded and hard to read', 'unreconciled bank statements', 'deadline: January 15th'],
    },
    {
      id: 'bk-n3', title: 'Cleanup Review', callerName: 'Lisa Park', callerCompany: 'Park & Associates',
      audioScript: "I think my previous bookkeeper made some mistakes on last year's books. I'm worried about an audit. Can you review everything and fix what's wrong? The tax year in question is 2024. There are about twelve months of transactions to review. I've already noticed three entries that don't match my bank statements.",
      keyPoints: ['previous bookkeeper made mistakes', 'worried about audit', 'tax year 2024', '12 months to review', '3 entries do not match bank statements', 'needs full review and corrections'],
    },
  ],
  'data-entry': [
    {
      id: 'de-n1', title: 'High-Volume Task', callerName: 'Sarah Chen', callerCompany: 'Chen Data Corp',
      audioScript: "I have a spreadsheet with five hundred customer records that need to be entered into our CRM by end of day. The formatting is inconsistent and some fields are missing. Can you handle this? The key fields are name, email, phone, company, and industry. Missing phone numbers should be marked as N/A. I need this done by five PM today.",
      keyPoints: ['500 customer records to enter', 'into CRM', 'inconsistent formatting', 'some fields missing', 'key fields: name, email, phone, company, industry', 'missing phones = N/A', 'deadline: 5 PM today'],
    },
    {
      id: 'de-n2', title: 'Data Migration', callerName: 'David Martinez', callerCompany: 'Martinez Logistics',
      audioScript: "We're migrating from our old system to a new database. I need all two thousand product records transferred accurately. There are custom fields that need to be mapped correctly. The product categories are electronics, clothing, home goods, and accessories. Each record has about fifteen fields. I need this done by the end of next week.",
      keyPoints: ['migrating to new database', '2,000 product records', 'custom fields need mapping', 'categories: electronics, clothing, home goods, accessories', '15 fields per record', 'deadline: end of next week'],
    },
    {
      id: 'de-n3', title: 'Error Discovery', callerName: 'Lisa Park', callerCompany: 'Park Analytics',
      audioScript: "I noticed some errors in the data you entered last week. Several customer phone numbers are wrong. We need to fix this before the marketing campaign goes out on Monday. I found about twenty-five records with incorrect phone numbers out of the two hundred you entered. Can you go through them all and verify each number against the original source?",
      keyPoints: ['errors in last weeks data', 'incorrect phone numbers', 'fix before Monday campaign', '25 incorrect out of 200 records', 'verify all numbers against original source'],
    },
  ],
};

// ─── Professional Scenario (Module 7) ───────────────────────

export interface ScenarioTopic {
  id: string;
  topic: string;
  prompt: string;
  keyTerms: string[];
}

type ScenarioBank = Record<PositionId, ScenarioTopic[]>;

export const POSITION_SCENARIOS: ScenarioBank = {
  'insurance-csr': [
    { id: 'icsr-s1', topic: 'Liability Coverage', prompt: "A customer calls and asks: 'What does liability coverage actually cover?' Please explain liability coverage in simple, friendly terms.", keyTerms: ['liability', 'at fault', 'bodily injury', 'property damage', 'legal responsibility'] },
    { id: 'icsr-s2', topic: 'Deductible', prompt: "A customer asks: 'Can you explain what a deductible is and how it works?' Please provide a clear explanation with an example.", keyTerms: ['deductible', 'out of pocket', 'claim', 'premium', 'before coverage'] },
    { id: 'icsr-s3', topic: 'Comprehensive Coverage', prompt: "A customer asks: 'What is comprehensive coverage and do I need it?' Please explain what comprehensive coverage includes.", keyTerms: ['comprehensive', 'non-collision', 'theft', 'vandalism', 'natural disaster'] },
    { id: 'icsr-s4', topic: 'Umbrella Policy', prompt: "A customer asks: 'My agent mentioned an umbrella policy. What is that and should I consider one?' Please explain umbrella policies.", keyTerms: ['umbrella', 'extra liability', 'beyond standard limits', 'lawsuit', 'assets'] },
  ],
  'insurance-sales': [
    { id: 'isales-s1', topic: 'Cross-Selling Auto to Home', prompt: "An existing auto insurance customer calls. How would you introduce the idea of bundling a home insurance policy? Explain the value naturally.", keyTerms: ['bundle', 'multi-line discount', 'save', 'comprehensive', 'existing customer'] },
    { id: 'isales-s2', topic: 'Overcoming Price Objection', prompt: "A prospect says your rate is forty dollars higher than a competitor. How do you justify the difference in price?", keyTerms: ['value', 'coverage difference', 'claims service', 'local agent', 'twenty-four seven'] },
    { id: 'isales-s3', topic: 'Closing the Sale', prompt: "A prospect is interested but hesitant. They say they need to think about it. How do you close without being pushy?", keyTerms: ['urgency', 'limited time', 'benefits summary', 'next steps', 'confirm'] },
    { id: 'isales-s4', topic: 'Explaining Umbrella Value', prompt: "A prospect asks why they need an umbrella policy when they already have full coverage. How do you explain the additional value?", keyTerms: ['umbrella', 'additional protection', 'assets', 'lawsuit', 'peace of mind'] },
  ],
  'cold-caller': [
    { id: 'cc-s1', topic: 'Opening Hook', prompt: "You're cold calling a business owner. How do you open the call in the first thirty seconds to keep them from hanging up?", keyTerms: ['brief', 'value', 'thirty seconds', 'no pressure', 'permission'] },
    { id: 'cc-s2', topic: 'Gatekeeper Navigation', prompt: "A gatekeeper says the decision maker is in a meeting. How do you get through without being pushy?", keyTerms: ['respectful', 'message', 'reason', 'callback', 'decision maker'] },
    { id: 'cc-s3', topic: 'Objection Handling', prompt: "A prospect says they already have a vendor and are happy. How do you respond to this objection?", keyTerms: ['acknowledge', 'comparison', 'value difference', 'no obligation', 'information'] },
    { id: 'cc-s4', topic: 'Voicemail Technique', prompt: "You reach a prospect's voicemail. What message do you leave that will make them want to call back?", keyTerms: ['brief', 'name', 'reason', 'callback', 'urgency'] },
  ],
  'sdr': [
    { id: 'sdr-s1', topic: 'Personalized Opening', prompt: "You're making an outbound call to a prospect who has never heard of you. How do you open with a personalized hook that earns the next thirty seconds?", keyTerms: ['research', 'relevance', 'permission', 'brief', 'no pitch'] },
    { id: 'sdr-s2', topic: 'Qualification (BANT)', prompt: "A prospect is willing to talk. How do you quickly qualify them on budget, authority, need, and timeline without it feeling like an interrogation?", keyTerms: ['budget', 'authority', 'need', 'timeline', 'conversational'] },
    { id: 'sdr-s3', topic: 'Send-Me-An-Email Objection', prompt: "A prospect says 'just send me an email.' How do you handle it and still move toward a booked meeting?", keyTerms: ['acknowledge', 'two questions', 'brief call', 'relevance', 'calendar'] },
    { id: 'sdr-s4', topic: 'Booking a Meeting That Shows Up', prompt: "The prospect is interested. How do you lock in a specific meeting time and reduce the chance of a no-show?", keyTerms: ['two options', 'specific time', 'calendar invite', 'reminder', 'confirm value'] },
  ],
  'appointment-setter': [
    { id: 'as-s1', topic: 'Securing Commitment', prompt: "A prospect is interested but won't commit to a specific time. How do you get them to lock in an appointment?", keyTerms: ['specific time', 'two options', 'confirm', 'calendar', 'value'] },
    { id: 'as-s2', topic: 'Handling Rescheduling', prompt: "A prospect keeps rescheduling. How do you handle this professionally without losing the lead?", keyTerms: ['understanding', 'firm', 'next available', 'confirm', 'no-show prevention'] },
    { id: 'as-s3', topic: 'Email Deflection', prompt: "A prospect says 'just send me an email instead.' How do you steer them toward a phone appointment?", keyTerms: ['email', 'brief call', 'ten minutes', 'questions', 'personal'] },
    { id: 'as-s4', topic: 'Confirmation Call', prompt: "How do you confirm an appointment the day before to reduce no-shows?", keyTerms: ['confirm', 'reminder', 'address', 'questions', 'looking forward'] },
  ],
  'executive-assistant': [
    { id: 'ea-s1', topic: 'Diplomatic Scheduling', prompt: "A colleague demands to see your executive immediately but the executive is unavailable. How do you handle this diplomatically?", keyTerms: ['diplomatic', 'unavailable', 'message', 'schedule', 'priority'] },
    { id: 'ea-s2', topic: 'Inbox Prioritization', prompt: "Your executive has an overflowing inbox. How do you explain your approach to prioritizing their emails?", keyTerms: ['prioritize', 'urgent', 'flag', 'delegate', 'summary'] },
    { id: 'ea-s3', topic: 'Confidential Information', prompt: "Someone calls asking for confidential information about your executive. How do you handle this professionally?", keyTerms: ['confidential', 'verify', 'authorization', 'unable', 'protocol'] },
    { id: 'ea-s4', topic: 'Meeting Preparation', prompt: "How would you describe your process for preparing an executive for an important board meeting?", keyTerms: ['briefing', 'agenda', 'documents', 'summary', 'key points'] },
  ],
  'general-va': [
    { id: 'gva-s1', topic: 'Client Communication', prompt: "A new client asks how you'll manage tasks remotely. How do you explain your process clearly and professionally?", keyTerms: ['communication', 'tools', 'updates', 'deadlines', 'transparency'] },
    { id: 'gva-s2', topic: 'Handling Vague Instructions', prompt: "A client gives you a task with unclear instructions and says 'just figure it out.' How do you respond professionally?", keyTerms: ['clarify', 'questions', 'confirm', 'expectations', 'proactive'] },
    { id: 'gva-s3', topic: 'Managing Multiple Clients', prompt: "How would you explain your approach to managing multiple clients simultaneously without dropping the ball?", keyTerms: ['prioritize', 'time blocks', 'communication', 'tracking', 'boundaries'] },
    { id: 'gva-s4', topic: 'Research Presentation', prompt: "A client asks you to research competitors. How do you present your findings in a useful format?", keyTerms: ['summary', 'spreadsheet', 'key findings', 'recommendations', 'organized'] },
  ],
  'customer-service': [
    { id: 'cs-s1', topic: 'De-escalation', prompt: "A customer is yelling about a billing error. How do you de-escalate the situation while resolving the issue?", keyTerms: ['calm', 'acknowledge', 'apologize', 'resolve', 'follow up'] },
    { id: 'cs-s2', topic: 'Refund Policy', prompt: "A customer wants a refund but it's against policy. How do you explain this without losing the customer?", keyTerms: ['policy', 'alternative', 'store credit', 'exception', 'understand'] },
    { id: 'cs-s3', topic: 'Empathy in Action', prompt: "A loyal customer is disappointed with their service. How do you show genuine empathy while fixing the problem?", keyTerms: ['empathy', 'loyal', 'value', 'resolve', 'personally'] },
    { id: 'cs-s4', topic: 'Escalation Handling', prompt: "A customer demands to speak to a supervisor. How do you handle this without making it feel like a failure?", keyTerms: ['supervisor', 'escalate', 'understand', 'resolve', 'stay involved'] },
  ],
  'receptionist': [
    { id: 'rec-s1', topic: 'Professional Greeting', prompt: "How do you answer the phone professionally for a medical office? Walk through your standard greeting.", keyTerms: ['greeting', 'office name', 'name', 'how may I help', 'professional'] },
    { id: 'rec-s2', topic: 'Call Screening', prompt: "A caller won't give their name but insists on being connected. How do you handle this professionally?", keyTerms: ['name', 'purpose', 'message', 'unable', 'protocol'] },
    { id: 'rec-s3', topic: 'Visitor Welcome', prompt: "A new patient arrives for their appointment. How do you welcome them and get them set up?", keyTerms: ['welcome', 'new patient', 'paperwork', 'insurance card', 'notify'] },
    { id: 'rec-s4', topic: 'Multiple Lines', prompt: "Multiple phone lines are ringing at once. How do you manage this situation professionally?", keyTerms: ['prioritize', 'hold', 'acknowledge', 'return', 'calm'] },
  ],
  'technical-support': [
    { id: 'ts-s1', topic: 'Plain Language Explanation', prompt: "A non-technical customer has an error code they don't understand. How do you explain it in plain English?", keyTerms: ['plain language', 'simple terms', 'no jargon', 'step by step', 'example'] },
    { id: 'ts-s2', topic: 'Frustrated Customer', prompt: "A customer has been on hold for an hour and is furious. How do you calm them while solving their problem?", keyTerms: ['apologize', 'acknowledge', 'calm', 'resolve', 'priority'] },
    { id: 'ts-s3', topic: 'Data Loss Empathy', prompt: "A customer is crying because they lost important files. How do you show empathy while troubleshooting?", keyTerms: ['empathy', 'reassure', 'options', 'recovery', 'support'] },
    { id: 'ts-s4', topic: 'Escalation', prompt: "How do you explain to a customer that their issue needs to be escalated to Tier 2 support?", keyTerms: ['escalate', 'specialist', 'priority', 'timeline', 'follow up'] },
  ],
  'medical-va': [
    { id: 'mva-s1', topic: 'HIPAA Compliance', prompt: "A family member calls asking for a patient's test results. How do you handle this while being empathetic and compliant?", keyTerms: ['HIPAA', 'authorization', 'unable', 'empathetic', 'protocol'] },
    { id: 'mva-s2', topic: 'Insurance Verification', prompt: "A patient needs to know if their insurance covers a procedure. How do you explain the verification process?", keyTerms: ['verify', 'coverage', 'copay', 'prior authorization', 'member ID'] },
    { id: 'mva-s3', topic: 'Patient Empathy', prompt: "An anxious patient is waiting for test results and calls repeatedly. How do you reassure them professionally?", keyTerms: ['empathy', 'reassure', 'timeline', 'follow up', 'understand'] },
    { id: 'mva-s4', topic: 'Medical Terminology', prompt: "A patient doesn't understand their diagnosis. How do you explain medical terms in simple language without giving medical advice?", keyTerms: ['simple terms', 'clarify', 'questions', 'physician', 'no advice'] },
  ],
  'real-estate-va': [
    { id: 'rva-s1', topic: 'Lead Qualification', prompt: "A buyer calls about a property. How do you qualify them without sounding interrogative?", keyTerms: ['pre-approval', 'agent', 'timeline', 'budget', 'naturally'] },
    { id: 'rva-s2', topic: 'Seller Management', prompt: "A seller is unhappy with their listing performance. How do you explain your marketing strategy confidently?", keyTerms: ['marketing', 'platforms', 'showings', 'feedback', 'adjustments'] },
    { id: 'rva-s3', topic: 'Offer Coordination', prompt: "A buyer wants to accept a counteroffer but needs time. How do you coordinate this with the seller's agent?", keyTerms: ['counter', 'timeline', 'communicate', 'deadline', 'confirm'] },
    { id: 'rva-s4', topic: 'Closing Preparation', prompt: "How do you explain the closing process to a first-time homebuyer?", keyTerms: ['closing', 'title', 'walk-through', 'documents', 'timeline'] },
  ],
  'ecommerce-va': [
    { id: 'eva-s1', topic: 'Lost Order Resolution', prompt: "A customer's tracking hasn't updated in days and they need the item urgently. How do you handle this?", keyTerms: ['carrier', 'trace', 'expedite', 'replacement', 'refund'] },
    { id: 'eva-s2', topic: 'Return Exception', prompt: "A customer wants to return past the window but has a valid reason. How do you handle this professionally?", keyTerms: ['exception', 'condition', 'store credit', 'policy', 'approve'] },
    { id: 'eva-s3', topic: 'Negative Review Response', prompt: "A customer left a negative review about receiving the wrong item. How do you respond publicly?", keyTerms: ['apologize', 'correct', 'expedite', 'personally', 'feedback'] },
    { id: 'eva-s4', topic: 'Chargeback Dispute', prompt: "A customer filed a chargeback. How do you communicate with them to resolve it?", keyTerms: ['chargeback', 'evidence', 'resolve', 'communicate', 'bank'] },
  ],
  'social-media-va': [
    { id: 'smva-s1', topic: 'Crisis Response', prompt: "A negative comment is gaining traction on a client's post. How do you advise the client to respond?", keyTerms: ['empathy', 'public', 'private', 'acknowledge', 'de-escalate'] },
    { id: 'smva-s2', topic: 'Brand Voice', prompt: "A client says your post doesn't match their brand voice. How do you adjust and explain your approach?", keyTerms: ['brand voice', 'adjust', 'guidelines', 'revise', 'consistent'] },
    { id: 'smva-s3', topic: 'Content Strategy', prompt: "A new client needs a content plan. How do you explain your strategy for growing their account?", keyTerms: ['calendar', 'platforms', 'engagement', 'hashtags', 'growth'] },
    { id: 'smva-s4', topic: 'Controversial Content', prompt: "A client wants to post something edgy that might get backlash. How do you advise them professionally?", keyTerms: ['risk', 'backlash', 'advice', 'alternative', 'engagement'] },
  ],
  'bookkeeper': [
    { id: 'bk-s1', topic: 'Plain Language Financials', prompt: "A client doesn't understand their profit and loss statement. How do you explain it in simple terms?", keyTerms: ['revenue', 'expenses', 'profit', 'simple terms', 'summary'] },
    { id: 'bk-s2', topic: 'Professional Boundary', prompt: "A client wants to categorize personal expenses as business expenses. How do you handle this professionally?", keyTerms: ['personal', 'business', 'compliance', 'cannot', 'explain'] },
    { id: 'bk-s3', topic: 'Discrepancy Explanation', prompt: "A client found an unfamiliar charge on their report. How do you explain the investigation process?", keyTerms: ['investigate', 'receipt', 'vendor', 'correct', 'transparent'] },
    { id: 'bk-s4', topic: 'Tax Preparation', prompt: "A client is behind on their books before tax season. How do you explain the cleanup process?", keyTerms: ['organize', 'receipts', 'categorize', 'deadline', 'priority'] },
  ],
  'data-entry': [
    { id: 'de-s1', topic: 'Accuracy Assurance', prompt: "A client is worried about data accuracy. How do you explain your quality assurance process?", keyTerms: ['verify', 'double-check', 'source', 'accuracy', 'report'] },
    { id: 'de-s2', topic: 'Deadline Communication', prompt: "A client needs a large volume of data entered urgently. How do you manage expectations?", keyTerms: ['timeline', 'volume', 'priority', 'communicate', 'realistic'] },
    { id: 'de-s3', topic: 'Error Handling', prompt: "You discover errors in data you previously entered. How do you communicate this to the client?", keyTerms: ['identified', 'corrected', 'apologize', 'prevention', 'transparent'] },
    { id: 'de-s4', topic: 'Vague Instructions', prompt: "A client gives unclear instructions for a data task. How do you clarify without seeming incompetent?", keyTerms: ['clarify', 'questions', 'confirm', 'proactive', 'examples'] },
  ],
};

// ─── Helper Functions ───────────────────────────────────────

export function getPronunciationItems(positionId: PositionId): PronunciationItem[] {
  return POSITION_PRONUNCIATION[positionId] ?? POSITION_PRONUNCIATION['general-va'];
}

export function getReadingItems(positionId: PositionId): ReadingItem[] {
  return POSITION_READING[positionId] ?? POSITION_READING['general-va'];
}

export function getNoteTakingItems(positionId: PositionId): NoteTakingItem[] {
  return POSITION_NOTE_TAKING[positionId] ?? POSITION_NOTE_TAKING['general-va'];
}

export function getScenarioTopics(positionId: PositionId): ScenarioTopic[] {
  return POSITION_SCENARIOS[positionId] ?? POSITION_SCENARIOS['general-va'];
}
