import type { PositionId } from './positionBank';

export interface ListeningScenario {
  id: string;
  scenario: string;
  audioScript: string;
  context: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export const POSITION_LISTENING_SCENARIOS: Record<PositionId, ListeningScenario[]> = {
  'insurance-csr': [
    {
      id: 'icsr-1',
      scenario: 'Policy Update Inquiry',
      context: 'Customer calling to update address and add coverage',
      audioScript: "Hi, I'm calling about my auto insurance policy number AX-4471. I recently moved to a new address in downtown Austin, and I wanted to check if my premium will change. Also, I'd like to add comprehensive coverage to my plan since I'm now parking on the street. Can you walk me through what that would cost per month and when the change would take effect?",
      questions: [
        { id: 'icsr-1-q1', question: "What is the caller's policy number?", options: ['AX-4471', 'AX-4771', 'AX-4147', 'AX-7414'], correctIndex: 0 },
        { id: 'icsr-1-q2', question: 'Why does the caller want to add comprehensive coverage?', options: ['They bought a new car', 'They are now parking on the street', 'Their car was stolen', 'Their lender requires it'], correctIndex: 1 },
        { id: 'icsr-1-q3', question: 'Where did the caller recently move to?', options: ['Downtown Dallas', 'Downtown Austin', 'Downtown Houston', 'Downtown San Antonio'], correctIndex: 1 },
      ],
    },
    {
      id: 'icsr-2',
      scenario: 'Claim Denial Dispute',
      context: 'Customer disputing a denied claim',
      audioScript: "My claim was denied and I don't understand why. The claim number is CL-22910, filed on October 15th. The adjuster said something about insufficient documentation but I submitted everything they asked for. I have photos, receipts, and a police report. I've been a loyal customer for eight years and I expect better treatment than this. Can you review my claim?",
      questions: [
        { id: 'icsr-2-q1', question: 'What is the claim number?', options: ['CL-22190', 'CL-22910', 'CL-29120', 'CL-22901'], correctIndex: 1 },
        { id: 'icsr-2-q2', question: 'When was the claim filed?', options: ['October 5th', 'October 10th', 'October 15th', 'October 25th'], correctIndex: 2 },
        { id: 'icsr-2-q3', question: 'How long has the customer been with the company?', options: ['Three years', 'Five years', 'Six years', 'Eight years'], correctIndex: 3 },
      ],
    },
    {
      id: 'icsr-3',
      scenario: 'Mortgage Proof of Insurance',
      context: 'Urgent request for proof of insurance',
      audioScript: "I need proof of insurance for my mortgage company by Friday. My lender is First National Bank, loan number 7842-CC. Can you fax or email the declarations page to them? The fax number is 555-0147 and the email is underwriting at firstnational dot com. My policy number is HO-33982 and it renews in March.",
      questions: [
        { id: 'icsr-3-q1', question: 'What is the loan number?', options: ['7842-CC', '7824-CC', '7842-DD', '7482-CC'], correctIndex: 0 },
        { id: 'icsr-3-q2', question: 'When does the customer need the proof?', options: ['By Monday', 'By Wednesday', 'By Friday', 'By next week'], correctIndex: 2 },
        { id: 'icsr-3-q3', question: 'What is the policy number?', options: ['HO-33892', 'HO-33982', 'HO-39382', 'HO-33928'], correctIndex: 1 },
      ],
    },
  ],

  'insurance-sales': [
    {
      id: 'isales-1',
      scenario: 'Price-Shopping Prospect',
      context: 'Prospect comparing rates',
      audioScript: "I'm shopping around for auto insurance. I currently pay $89 a month with Geico. Can you beat that rate? I have a clean driving record, I'm 34 years old, and I drive about 12,000 miles a year. I'm also interested in bundling with a renters policy if the discount is worth it. What can you offer me?",
      questions: [
        { id: 'isales-1-q1', question: 'How much does the prospect currently pay per month?', options: ['$89', '$98', '$99', '$108'], correctIndex: 0 },
        { id: 'isales-1-q2', question: 'How old is the prospect?', options: ['30', '32', '34', '36'], correctIndex: 2 },
        { id: 'isales-1-q3', question: 'What is the prospect interested in bundling with?', options: ['A home policy', 'A renters policy', 'A life policy', 'A boat policy'], correctIndex: 1 },
      ],
    },
    {
      id: 'isales-2',
      scenario: 'Warm Referral - Bundling',
      context: 'Referred prospect interested in bundling home and auto',
      audioScript: "My friend recommended you. I just bought a new home for $385,000 and I'm wondering if I should bundle it with my auto policy. I currently pay $142 a month for auto. What kind of discount would I get for bundling? Also, do you offer any discounts for having a security system installed?",
      questions: [
        { id: 'isales-2-q1', question: 'How much did the prospect buy the home for?', options: ['$358,000', '$385,000', '$388,000', '$358,500'], correctIndex: 1 },
        { id: 'isales-2-q2', question: 'What does the prospect currently pay for auto?', options: ['$124', '$142', '$144', '$124'], correctIndex: 1 },
        { id: 'isales-2-q3', question: 'What discount does the prospect ask about?', options: ['Safe driver discount', 'Multi-car discount', 'Security system discount', 'Loyalty discount'], correctIndex: 2 },
      ],
    },
    {
      id: 'isales-3',
      scenario: 'Loyalty Objection',
      context: 'Long-time customer of competitor considering switch',
      audioScript: "I've been with State Farm for 15 years. Why should I switch to your company? What makes your coverage better than what I already have? I pay $115 a month for full coverage on a 2019 Toyota Camry. I've never had a claim and I have a perfect driving record. Give me one good reason to switch.",
      questions: [
        { id: 'isales-3-q1', question: 'How long has the prospect been with State Farm?', options: ['10 years', '12 years', '15 years', '18 years'], correctIndex: 2 },
        { id: 'isales-3-q2', question: 'What car does the prospect drive?', options: ['2018 Honda Accord', '2019 Toyota Camry', '2020 Toyota Corolla', '2019 Honda Civic'], correctIndex: 1 },
        { id: 'isales-3-q3', question: 'How much does the prospect pay per month?', options: ['$105', '$115', '$125', '$150'], correctIndex: 1 },
      ],
    },
  ],

  'cold-caller': [
    {
      id: 'cc-1',
      scenario: 'Surprised Prospect',
      context: 'Prospect caught off guard by cold call',
      audioScript: "Hello? Yes, this is he. I wasn't expecting a call — what is this about exactly? I'm in the middle of something. Look, I have about 30 seconds before my next meeting starts. If this is a sales call, I'm going to hang up. Make it quick.",
      questions: [
        { id: 'cc-1-q1', question: 'How much time does the prospect give before their next meeting?', options: ['15 seconds', '30 seconds', '45 seconds', '60 seconds'], correctIndex: 1 },
        { id: 'cc-1-q2', question: 'What does the prospect threaten to do if it is a sales call?', options: ['Report the number', 'Hang up', 'Block the caller', 'Ask for a manager'], correctIndex: 1 },
        { id: 'cc-1-q3', question: 'What is the prospect doing when the call comes in?', options: ['Eating lunch', 'In a meeting', 'In the middle of something', 'About to leave work'], correctIndex: 2 },
      ],
    },
    {
      id: 'cc-2',
      scenario: 'Gatekeeper Screening',
      context: 'Office manager blocking access to decision maker',
      audioScript: "I'm the office manager here. Mr. Johnson is in a meeting and can't be disturbed. Can I take a message? What company are you with and what is this regarding? He gets a lot of calls and I need to screen them. If it's important, I'll make sure he gets the message, but I can't promise he'll call back today.",
      questions: [
        { id: 'cc-2-q1', question: 'What is the gatekeeper role?', options: ['Receptionist', 'Office manager', 'Executive assistant', 'Secretary'], correctIndex: 1 },
        { id: 'cc-2-q2', question: 'Why can the gatekeeper not put the caller through?', options: ["Mr. Johnson is on vacation", 'Mr. Johnson is in a meeting', 'Mr. Johnson is on another call', 'Mr. Johnson is out sick'], correctIndex: 1 },
        { id: 'cc-2-q3', question: 'What does the gatekeeper ask for?', options: ['A callback number', 'Company name and reason for calling', 'An email address', 'A reference number'], correctIndex: 1 },
      ],
    },
    {
      id: 'cc-3',
      scenario: 'Competitor Objection',
      context: 'Prospect happy with current vendor',
      audioScript: "Look, we already have a vendor for that and we're happy with them. We've been with them for three years and they do a fine job. I don't see why I should switch. We have a contract anyway, so even if I wanted to change, I couldn't for another eight months. So there's really no point in this call.",
      questions: [
        { id: 'cc-3-q1', question: 'How long has the prospect been with their current vendor?', options: ['One year', 'Two years', 'Three years', 'Five years'], correctIndex: 2 },
        { id: 'cc-3-q2', question: 'How much time is left on the prospect contract?', options: ['Four months', 'Six months', 'Eight months', 'Ten months'], correctIndex: 2 },
        { id: 'cc-3-q3', question: 'What does the prospect say about their current vendor?', options: ['They are too expensive', 'They do a fine job', 'They are unreliable', 'They are going out of business'], correctIndex: 1 },
      ],
    },
  ],

  'sdr': [
    {
      id: 'sdr-1',
      scenario: 'Qualifying the Right Contact',
      context: 'SDR confirming decision-making authority',
      audioScript: "Thanks for taking my call. I noticed your company just opened two new offices, so I wanted to reach out. Quick question before I go on — are you the person who owns decisions about your sales tools, or would that be someone else on your team? I don't want to waste your time if I should be talking to a colleague.",
      questions: [
        { id: 'sdr-1-q1', question: 'What recent change did the caller notice about the company?', options: ['A new product launch', 'Two new offices opened', 'A leadership change', 'A funding round'], correctIndex: 1 },
        { id: 'sdr-1-q2', question: 'What is the caller trying to confirm?', options: ['The budget', 'Whether this is the right decision maker', 'The contract end date', 'The company size'], correctIndex: 1 },
        { id: 'sdr-1-q3', question: 'Why does the caller ask this up front?', options: ['To sound polite', 'To avoid wasting time on the wrong person', 'To get a referral fee', 'To end the call quickly'], correctIndex: 1 },
      ],
    },
    {
      id: 'sdr-2',
      scenario: 'Busy, Skeptical Prospect',
      context: 'Prospect who recently evaluated competitors',
      audioScript: "Honestly this is a bad time, we're heads-down on a product launch this week. But quickly — what is this about? If it's another sales tool, I'll tell you now, we looked at two of those last quarter and passed on both. So unless you've got something genuinely different, I'm not sure this is worth a meeting.",
      questions: [
        { id: 'sdr-2-q1', question: 'Why is it a bad time for the prospect?', options: ['They are on vacation', 'They are in a product launch', 'They are in a budget freeze', 'They are hiring'], correctIndex: 1 },
        { id: 'sdr-2-q2', question: 'What did the prospect do last quarter?', options: ['Signed a contract', 'Looked at two similar tools and passed', 'Switched vendors', 'Cut the budget'], correctIndex: 1 },
        { id: 'sdr-2-q3', question: 'What would make the prospect reconsider?', options: ['A lower price', 'Something genuinely different', 'A free trial', 'A referral'], correctIndex: 1 },
      ],
    },
    {
      id: 'sdr-3',
      scenario: 'Qualified and Ready to Book',
      context: 'Warmed-up prospect sharing qualifying details',
      audioScript: "Okay, you've got my attention. We're a 40-person team, we run everything through HubSpot, and honestly our biggest headache is that our reps burn hours on leads that were never a fit. If your tool actually helps with that, I could do a 20-minute call next Tuesday or Wednesday afternoon. Send me a calendar invite and I'll be there.",
      questions: [
        { id: 'sdr-3-q1', question: 'How large is the prospect team?', options: ['20 people', '40 people', '60 people', '100 people'], correctIndex: 1 },
        { id: 'sdr-3-q2', question: 'What is the prospect biggest pain point?', options: ['Reps waste time on unqualified leads', 'Pricing is too high', 'They lack a CRM', 'Their team is too small'], correctIndex: 0 },
        { id: 'sdr-3-q3', question: 'When is the prospect available to meet?', options: ['Monday morning', 'Tuesday or Wednesday afternoon', 'Friday evening', 'Next month'], correctIndex: 1 },
      ],
    },
  ],

  'appointment-setter': [
    {
      id: 'as-1',
      scenario: 'Scheduling with Availability Constraints',
      context: 'Prospect with limited availability',
      audioScript: "Sure, I'd be happy to set up a time to talk. I work during the day though, so it would have to be in the evening or on the weekend. I'm available Tuesday and Thursday evenings between 6 and 8 PM, or any time on Saturday. I prefer mornings on Saturday, say between 9 and 11. What times do you have available on your end?",
      questions: [
        { id: 'as-1-q1', question: 'When is the prospect available on weekdays?', options: ['Tuesday and Thursday mornings', 'Tuesday and Thursday evenings', 'Monday and Wednesday evenings', 'Wednesday and Friday evenings'], correctIndex: 1 },
        { id: 'as-1-q2', question: 'What time range does the prospect prefer on Saturday?', options: ['7 to 9 AM', '9 to 11 AM', '11 AM to 1 PM', '1 to 3 PM'], correctIndex: 1 },
        { id: 'as-1-q3', question: 'What are the evening availability hours?', options: ['4 to 6 PM', '5 to 7 PM', '6 to 8 PM', '7 to 9 PM'], correctIndex: 2 },
      ],
    },
    {
      id: 'as-2',
      scenario: 'Rescheduling Request',
      context: 'Prospect pushing back appointment',
      audioScript: "I said I'd call back but honestly I've been really busy. Can we push this to next week? I just don't have time this week. I have a big presentation on Friday and I need to prepare. Maybe Wednesday or Thursday next week would work. Morning would be better, around 10 or 11. Can you do that?",
      questions: [
        { id: 'as-2-q1', question: 'Why does the prospect need to reschedule?', options: ['A family emergency', 'A big presentation on Friday', 'They are traveling', 'They are sick'], correctIndex: 1 },
        { id: 'as-2-q2', question: 'When does the prospect want to reschedule to?', options: ['This Friday', 'Next Monday', 'Next Wednesday or Thursday', 'Next weekend'], correctIndex: 2 },
        { id: 'as-2-q3', question: 'What time of day does the prospect prefer?', options: ['Early morning around 8', 'Morning around 10 or 11', 'Afternoon around 2', 'Evening around 6'], correctIndex: 1 },
      ],
    },
    {
      id: 'as-3',
      scenario: 'Conditional Interest',
      context: 'Prospect needs to consult partner before committing',
      audioScript: "I'm interested but I need to check with my business partner first. Can you call me back on Thursday afternoon around 2? That's when we have our weekly meeting and I'll be able to discuss it with her. If she agrees, we can move forward. My number is 555-0187, extension 42.",
      questions: [
        { id: 'as-3-q1', question: 'Who does the prospect need to check with?', options: ['Their spouse', 'Their business partner', 'Their lawyer', 'Their accountant'], correctIndex: 1 },
        { id: 'as-3-q2', question: 'When does the prospect want to be called back?', options: ['Wednesday morning', 'Thursday afternoon around 2', 'Friday afternoon around 3', 'Thursday morning around 10'], correctIndex: 1 },
        { id: 'as-3-q3', question: 'What is the prospect phone extension?', options: ['Extension 24', 'Extension 42', 'Extension 44', 'Extension 87'], correctIndex: 1 },
      ],
    },
  ],

  'executive-assistant': [
    {
      id: 'ea-1',
      scenario: 'Complex Rescheduling Request',
      context: 'CEO office requesting schedule changes',
      audioScript: "Hi, this is Sarah from the CEO's office. Mark needs to move the 2 PM strategy meeting to 3:30 PM tomorrow. Also, he wants to add a 15-minute prep call with the CFO beforehand at 3:10 PM. Can you update the calendar and notify all the attendees? There are six people on the invite list.",
      questions: [
        { id: 'ea-1-q1', question: 'What time is the strategy meeting being moved to?', options: ['2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM'], correctIndex: 2 },
        { id: 'ea-1-q2', question: 'What time is the prep call with the CFO?', options: ['2:45 PM', '3:00 PM', '3:10 PM', '3:15 PM'], correctIndex: 2 },
        { id: 'ea-1-q3', question: 'How many attendees are on the invite list?', options: ['Four', 'Five', 'Six', 'Seven'], correctIndex: 2 },
      ],
    },
    {
      id: 'ea-2',
      scenario: 'Cross-Timezone Coordination',
      context: 'London office requesting meeting with executive',
      audioScript: "I'm calling from the London office. Our managing director needs to speak with your executive sometime this week. She's available Tuesday or Wednesday between 9 AM and noon GMT. That would be 4 AM to 7 AM your time, Eastern. Or if your executive can do early morning, we could also do Thursday at 8 AM GMT, which is 5 AM your time.",
      questions: [
        { id: 'ea-2-q1', question: 'When is the London director available?', options: ['Monday or Tuesday', 'Tuesday or Wednesday', 'Wednesday or Thursday', 'Thursday or Friday'], correctIndex: 1 },
        { id: 'ea-2-q2', question: 'What time zone is the London office in?', options: ['EST', 'PST', 'GMT', 'CET'], correctIndex: 2 },
        { id: 'ea-2-q3', question: 'What does 9 AM GMT convert to in Eastern time?', options: ['3 AM', '4 AM', '5 AM', '6 AM'], correctIndex: 1 },
      ],
    },
    {
      id: 'ea-3',
      scenario: 'Urgent Rescheduling',
      context: 'Board meeting moved up by two days',
      audioScript: "The board meeting has been moved up by two days. We need to reschedule everything on the executive's calendar for Thursday and Friday. Can you make it work? The board meeting is now Thursday at 10 AM. The executive also has a lunch with the investors at noon that day, and a call with the Asia team at 4 PM.",
      questions: [
        { id: 'ea-3-q1', question: 'By how many days was the board meeting moved up?', options: ['One day', 'Two days', 'Three days', 'A week'], correctIndex: 1 },
        { id: 'ea-3-q2', question: 'When is the board meeting now scheduled?', options: ['Wednesday at 9 AM', 'Thursday at 10 AM', 'Friday at 11 AM', 'Thursday at 2 PM'], correctIndex: 1 },
        { id: 'ea-3-q3', question: 'What time is the investor lunch?', options: ['11 AM', 'Noon', '1 PM', '2 PM'], correctIndex: 1 },
      ],
    },
  ],

  'general-va': [
    {
      id: 'gva-1',
      scenario: 'New Client Onboarding',
      context: 'Small business owner needing VA help',
      audioScript: "Hi, I need someone to help me manage my inbox, schedule some appointments, and do some light research on competitors. I run a small marketing agency and I'm getting overwhelmed. I have about 200 emails a day and I can't keep up. Can you start next week? I'd need you for about 15 hours a week to start.",
      questions: [
        { id: 'gva-1-q1', question: 'What type of business does the client run?', options: ['A law firm', 'A marketing agency', 'A real estate office', 'An accounting firm'], correctIndex: 1 },
        { id: 'gva-1-q2', question: 'How many emails does the client receive per day?', options: ['About 100', 'About 150', 'About 200', 'About 250'], correctIndex: 2 },
        { id: 'gva-1-q3', question: 'How many hours per week does the client need initially?', options: ['10 hours', '15 hours', '20 hours', '25 hours'], correctIndex: 1 },
      ],
    },
    {
      id: 'gva-2',
      scenario: 'Data Organization Task',
      context: 'Client requesting spreadsheet organization',
      audioScript: "I sent you a list of 50 contacts yesterday. I need them organized into a spreadsheet by industry, with notes on each one. Also, can you find their email addresses? I need this by Friday. The industries I want are healthcare, technology, finance, and retail. Put them in separate tabs in the spreadsheet.",
      questions: [
        { id: 'gva-2-q1', question: 'How many contacts need to be organized?', options: ['30', '40', '50', '60'], correctIndex: 2 },
        { id: 'gva-2-q2', question: 'When does the client need the spreadsheet?', options: ['By Wednesday', 'By Thursday', 'By Friday', 'By Monday'], correctIndex: 2 },
        { id: 'gva-2-q3', question: 'How many industry categories are needed?', options: ['Three', 'Four', 'Five', 'Six'], correctIndex: 1 },
      ],
    },
    {
      id: 'gva-3',
      scenario: 'Rushed Deadline',
      context: 'Client moving deadline earlier',
      audioScript: "I know I said the report was due Friday, but my investor meeting got moved up. Can you have it ready by Wednesday morning instead? I know it's short notice. The report needs to include the Q3 revenue breakdown, the marketing spend analysis, and the customer retention metrics. I also need a one-page summary on top of the full report.",
      questions: [
        { id: 'gva-3-q1', question: 'When was the report originally due?', options: ['Wednesday', 'Thursday', 'Friday', 'Monday'], correctIndex: 2 },
        { id: 'gva-3-q2', question: 'When does the client now need the report?', options: ['Tuesday morning', 'Wednesday morning', 'Thursday morning', 'Friday morning'], correctIndex: 1 },
        { id: 'gva-3-q3', question: 'What does the client need in addition to the full report?', options: ['A slide deck', 'A one-page summary', 'An executive memo', 'A data appendix'], correctIndex: 1 },
      ],
    },
  ],

  'customer-service': [
    {
      id: 'cs-1',
      scenario: 'Late / Missing Delivery',
      context: 'Customer whose package was not received',
      audioScript: "I ordered a package two weeks ago and it still hasn't arrived. The tracking says it was delivered but I never got it. I've called twice already and nobody has helped me. This is the third time I'm calling! The order number is FB-77291 and it was a $120 pair of shoes. I want a refund or a replacement shipped overnight.",
      questions: [
        { id: 'cs-1-q1', question: 'How long ago was the order placed?', options: ['One week', 'Ten days', 'Two weeks', 'Three weeks'], correctIndex: 2 },
        { id: 'cs-1-q2', question: 'What is the order number?', options: ['FB-77219', 'FB-77291', 'FB-79221', 'FB-72791'], correctIndex: 1 },
        { id: 'cs-1-q3', question: 'How much was the order?', options: ['$100', '$110', '$120', '$130'], correctIndex: 2 },
      ],
    },
    {
      id: 'cs-2',
      scenario: 'Return Without Receipt',
      context: 'Customer trying to return without proof of purchase',
      audioScript: "I need to return this product but I lost the receipt. I bought it three weeks ago with my credit card. Can you look it up? My name is Jennifer Park. The product is a blue coffee maker, model CM-450. It stopped working after a week. I paid $65 for it and I just want store credit at this point.",
      questions: [
        { id: 'cs-2-q1', question: 'When did the customer buy the product?', options: ['One week ago', 'Two weeks ago', 'Three weeks ago', 'Four weeks ago'], correctIndex: 2 },
        { id: 'cs-2-q2', question: 'What is the product model?', options: ['CM-400', 'CM-450', 'CM-415', 'CM-505'], correctIndex: 1 },
        { id: 'cs-2-q3', question: 'What does the customer want?', options: ['A full refund', 'Store credit', 'An exchange', 'A replacement'], correctIndex: 1 },
      ],
    },
    {
      id: 'cs-3',
      scenario: 'Billing Dispute',
      context: 'Customer double-charged',
      audioScript: "I've been a customer for five years and I've never had this problem before. My account was charged twice this month and I need it fixed today, not in 3 to 5 business days. The two charges are for $89 each on October 3rd and October 17th. I called last week and was told it would be fixed but it wasn't.",
      questions: [
        { id: 'cs-3-q1', question: 'How long has the customer been with the company?', options: ['Three years', 'Four years', 'Five years', 'Six years'], correctIndex: 2 },
        { id: 'cs-3-q2', question: 'How much was each charge?', options: ['$78', '$89', '$98', '$99'], correctIndex: 1 },
        { id: 'cs-3-q3', question: 'When was the second charge?', options: ['October 3rd', 'October 7th', 'October 17th', 'October 27th'], correctIndex: 2 },
      ],
    },
  ],

  'receptionist': [
    {
      id: 'rec-1',
      scenario: 'New Visitor Arrival',
      context: 'New patient checking in for appointment',
      audioScript: "Hi, I'm here for my 2 o'clock appointment with Dr. Reynolds. My name is Margaret Chen. I'm a new patient so I might need to fill out some paperwork. I brought my insurance card and a list of my current medications. Also, I need to update my address — I moved last month from Oak Street to Pine Avenue.",
      questions: [
        { id: 'rec-1-q1', question: 'What time is the appointment?', options: ['1 PM', '2 PM', '3 PM', '4 PM'], correctIndex: 1 },
        { id: 'rec-1-q2', question: 'What is the visitor name?', options: ['Margaret Chen', 'Margaret Chan', 'Megan Chen', 'Margaret Cheng'], correctIndex: 0 },
        { id: 'rec-1-q3', question: 'What did the visitor bring?', options: ['A referral letter and ID', 'An insurance card and medication list', 'Medical records and ID', 'A photo ID and insurance card'], correctIndex: 1 },
      ],
    },
    {
      id: 'rec-2',
      scenario: 'Insistent Caller',
      context: 'Caller demanding to speak with owner',
      audioScript: "I need to speak with the owner immediately. It's about a legal matter and I can't leave a message. I'll hold until they're available. I've been trying to reach them for three days and nobody has called me back. This is regarding a contract dispute for invoice number INV-4409. If I don't hear back today, I'll have my lawyer call.",
      questions: [
        { id: 'rec-2-q1', question: 'What does the caller want to discuss?', options: ['A billing error', 'A legal matter', 'A product complaint', 'A contract dispute'], correctIndex: 1 },
        { id: 'rec-2-q2', question: 'How long has the caller been trying to reach the owner?', options: ['One day', 'Two days', 'Three days', 'A week'], correctIndex: 2 },
        { id: 'rec-2-q3', question: 'What is the invoice number?', options: ['INV-4409', 'INV-4490', 'INV-4049', 'INV-4940'], correctIndex: 0 },
      ],
    },
    {
      id: 'rec-3',
      scenario: 'Delivery Situation',
      context: 'Delivery driver stuck in lobby',
      audioScript: "I have a delivery for Suite 400 but the receptionist up there isn't answering. I've been waiting in the lobby for 15 minutes. The package requires a signature and I can't just leave it at the front desk. It's from MedSupply Incorporated and it's marked as temperature-controlled. What should I do? My schedule is tight and I have four more deliveries.",
      questions: [
        { id: 'rec-3-q1', question: 'Which suite is the delivery for?', options: ['Suite 300', 'Suite 400', 'Suite 410', 'Suite 440'], correctIndex: 1 },
        { id: 'rec-3-q2', question: 'How long has the driver been waiting?', options: ['5 minutes', '10 minutes', '15 minutes', '20 minutes'], correctIndex: 2 },
        { id: 'rec-3-q3', question: 'What is special about the package?', options: ['It is fragile', 'It requires a signature', 'It is temperature-controlled', 'It is oversized'], correctIndex: 2 },
      ],
    },
  ],

  'technical-support': [
    {
      id: 'ts-1',
      scenario: 'Urgent Connectivity Issue',
      context: 'Customer whose WiFi is not working',
      audioScript: "My computer won't connect to the WiFi. It was working fine this morning but now it just says 'no internet'. I've tried restarting it twice. I work from home and I'm losing money every minute I'm offline. The router lights are all green except for the one that's blinking orange. I'm on a Windows 11 laptop and my router is a Netgear Nighthawk.",
      questions: [
        { id: 'ts-1-q1', question: 'How many times has the customer restarted?', options: ['Once', 'Twice', 'Three times', 'Not at all'], correctIndex: 1 },
        { id: 'ts-1-q2', question: 'What does the customer see on the router?', options: ['All lights green', 'All lights orange', 'All green except one blinking orange', 'All lights red'], correctIndex: 2 },
        { id: 'ts-1-q3', question: 'What router model does the customer have?', options: ['Asus RT-AC88U', 'Netgear Nighthawk', 'TP-Link Archer', 'Linksys EA7500'], correctIndex: 1 },
      ],
    },
    {
      id: 'ts-2',
      scenario: 'Non-Technical Customer with Error',
      context: 'Customer confused by error code',
      audioScript: "I keep getting this error code 0x80070002 when I try to update. I've searched online but nothing makes sense. Can you just tell me what to do in plain English? I'm not very good with computers. I have a desktop PC that I use mostly for email and browsing. The update is for Windows, I think. It's been failing for about a week now.",
      questions: [
        { id: 'ts-2-q1', question: 'What is the error code?', options: ['0x80070002', '0x80072002', '0x80070020', '0x80071002'], correctIndex: 0 },
        { id: 'ts-2-q2', question: 'How long has the update been failing?', options: ['Two days', 'Four days', 'A week', 'Two weeks'], correctIndex: 2 },
        { id: 'ts-2-q3', question: 'What does the customer primarily use the PC for?', options: ['Gaming and streaming', 'Email and browsing', 'Video editing', 'Office work'], correctIndex: 1 },
      ],
    },
    {
      id: 'ts-3',
      scenario: 'Potential Scam / Malware',
      context: 'Customer who clicked a suspicious link',
      audioScript: "I think I clicked on a bad link and now my screen is frozen with a popup saying my computer has a virus. It wants me to call a number. What should I do? I haven't called the number yet. The popup has a blue background and says 'Microsoft Security Alert' at the top. My mouse still moves but I can't close the window. I have important files on this computer.",
      questions: [
        { id: 'ts-3-q1', question: 'What does the popup claim to be?', options: ['A Windows Update', 'A Microsoft Security Alert', 'An antivirus notification', 'A browser warning'], correctIndex: 1 },
        { id: 'ts-3-q2', question: 'What can the customer still do?', options: ['Nothing at all', 'Move the mouse but not close the window', 'Close the window but not the browser', 'Use keyboard shortcuts only'], correctIndex: 1 },
        { id: 'ts-3-q3', question: 'Has the customer called the number?', options: ['Yes, they called', 'No, they have not called', 'They are about to call', 'They texted the number'], correctIndex: 1 },
      ],
    },
  ],

  'medical-va': [
    {
      id: 'mva-1',
      scenario: 'Post-Surgery Follow-Up Scheduling',
      context: 'Patient calling to schedule follow-up',
      audioScript: "I need to schedule a follow-up with Dr. Patel. I had surgery three weeks ago and I'm still having some pain. I also need to check if my insurance covers the visit because I just switched to Blue Cross. My member ID is BCB-4471902. I'd prefer a morning appointment, preferably before 10 AM. I'm available Tuesday through Friday next week.",
      questions: [
        { id: 'mva-1-q1', question: 'How long ago did the patient have surgery?', options: ['One week', 'Two weeks', 'Three weeks', 'Four weeks'], correctIndex: 2 },
        { id: 'mva-1-q2', question: 'What insurance did the patient switch to?', options: ['Aetna', 'Blue Cross', 'Cigna', 'United Health'], correctIndex: 1 },
        { id: 'mva-1-q3', question: 'When is the patient available next week?', options: ['Monday through Wednesday', 'Tuesday through Friday', 'Monday through Thursday', 'Wednesday through Friday'], correctIndex: 1 },
      ],
    },
    {
      id: 'mva-2',
      scenario: 'Billing / Insurance Dispute',
      context: 'Patient questioning a bill amount',
      audioScript: "This is Maria Lopez calling. I received a bill for $840 for my MRI but my insurance should have covered most of it. Can you explain what happened? My member ID is BCB-4471902. The MRI was done on September 12th at the imaging center on Fifth Street. I was told I would only owe a $50 copay, not $840.",
      questions: [
        { id: 'mva-2-q1', question: 'How much was the bill?', options: ['$480', '$804', '$840', '$870'], correctIndex: 2 },
        { id: 'mva-2-q2', question: 'When was the MRI done?', options: ['September 2nd', 'September 12th', 'September 20th', 'September 22nd'], correctIndex: 1 },
        { id: 'mva-2-q3', question: 'How much was the patient told they would owe?', options: ['$15', '$50', '$80', '$85'], correctIndex: 1 },
      ],
    },
    {
      id: 'mva-3',
      scenario: 'Medical Records Request',
      context: 'Patient needing records sent to specialist',
      audioScript: "I need to get my medical records sent to a new specialist I'm seeing next week. Can you help me with that? I'll need them by Tuesday. The specialist is Dr. Nguyen at the Riverside Neurology Clinic. Her fax number is 555-0193. I also want a copy mailed to my home address for my own records.",
      questions: [
        { id: 'mva-3-q1', question: 'When does the patient need the records?', options: ['By Monday', 'By Tuesday', 'By Wednesday', 'By Friday'], correctIndex: 1 },
        { id: 'mva-3-q2', question: 'Who is the specialist?', options: ['Dr. Nguyen', 'Dr. Park', 'Dr. Patel', 'Dr. Reynolds'], correctIndex: 0 },
        { id: 'mva-3-q3', question: 'What is the specialist fax number?', options: ['555-0139', '555-0193', '555-0913', '555-0319'], correctIndex: 1 },
      ],
    },
  ],

  'real-estate-va': [
    {
      id: 'rva-1',
      scenario: 'Hot Buyer Lead',
      context: 'Interested buyer wanting a showing',
      audioScript: "Hi, I saw the listing for the property on Maple Street. I'm very interested and I'd like to see it as soon as possible. I'm pre-approved for $450K. Can we schedule a showing this weekend? Saturday afternoon would be ideal, around 2 PM. My agent is Jennifer Torres with Coastal Realty.",
      questions: [
        { id: 'rva-1-q1', question: 'What street is the property on?', options: ['Oak Street', 'Maple Street', 'Pine Street', 'Cedar Street'], correctIndex: 1 },
        { id: 'rva-1-q2', question: 'How much is the buyer pre-approved for?', options: ['$400K', '$425K', '$450K', '$475K'], correctIndex: 2 },
        { id: 'rva-1-q3', question: 'Who is the buyer agent?', options: ['Jennifer Torres', 'Jennifer Taylor', 'Jessica Torres', 'Janet Torres'], correctIndex: 0 },
      ],
    },
    {
      id: 'rva-2',
      scenario: 'Frustrated Seller',
      context: 'Seller unhappy with listing performance',
      audioScript: "Our house has been on the market for 90 days and we've only had two showings. We're thinking about switching agents. What can you tell me about your marketing strategy? The house is listed at $389,000 and we're not willing to drop the price below $375,000. We feel like the photos don't do it justice.",
      questions: [
        { id: 'rva-2-q1', question: 'How many days has the house been on the market?', options: ['60 days', '75 days', '90 days', '120 days'], correctIndex: 2 },
        { id: 'rva-2-q2', question: 'What is the current listing price?', options: ['$378,000', '$389,000', '$398,000', '$399,000'], correctIndex: 1 },
        { id: 'rva-2-q3', question: 'What is the seller minimum price?', options: ['$365,000', '$370,000', '$375,000', '$379,000'], correctIndex: 2 },
      ],
    },
    {
      id: 'rva-3',
      scenario: 'Offer Negotiation',
      context: 'Buyer countering on a property',
      audioScript: "I submitted an offer on the Oak Lane property yesterday. The seller countered at $420K. We want to accept but we need 24 hours to move some money around. Can you let the seller know? Our original offer was $410K. We can come up to $415K if they can cover the closing costs. Let me know by tomorrow morning.",
      questions: [
        { id: 'rva-3-q1', question: 'What street is the property on?', options: ['Maple Lane', 'Oak Lane', 'Pine Lane', 'Elm Lane'], correctIndex: 1 },
        { id: 'rva-3-q2', question: 'What was the seller counter offer?', options: ['$410K', '$415K', '$420K', '$425K'], correctIndex: 2 },
        { id: 'rva-3-q3', question: 'How much time does the buyer need?', options: ['12 hours', '24 hours', '48 hours', '72 hours'], correctIndex: 1 },
      ],
    },
  ],

  'ecommerce-va': [
    {
      id: 'eva-1',
      scenario: 'Lost Order Inquiry',
      context: 'Customer tracking not updating',
      audioScript: "I ordered a blender two weeks ago and the tracking hasn't updated in 6 days. I need it for a party this weekend. Order number is EC-88210. What's going on? The tracking says it left the warehouse in Dallas on the 14th but nothing since then. I paid $64 for it and I need it by Saturday or I want a refund.",
      questions: [
        { id: 'eva-1-q1', question: 'How many days has the tracking not updated?', options: ['3 days', '4 days', '5 days', '6 days'], correctIndex: 3 },
        { id: 'eva-1-q2', question: 'What is the order number?', options: ['EC-88120', 'EC-88210', 'EC-88201', 'EC-82810'], correctIndex: 1 },
        { id: 'eva-1-q3', question: 'How much did the customer pay?', options: ['$46', '$64', '$66', '$86'], correctIndex: 1 },
      ],
    },
    {
      id: 'eva-2',
      scenario: 'Wrong Item Received',
      context: 'Customer received wrong size',
      audioScript: "I received the wrong size shoes. I ordered a size 8 but got a size 10. I need the correct size by next week for an event. How do we fix this? The order number is SH-44729. I don't want to pay for return shipping since it was your mistake. Can you send the right size with expedited shipping?",
      questions: [
        { id: 'eva-2-q1', question: 'What size did the customer order?', options: ['Size 7', 'Size 8', 'Size 9', 'Size 10'], correctIndex: 1 },
        { id: 'eva-2-q2', question: 'What size did the customer receive?', options: ['Size 9', 'Size 10', 'Size 11', 'Size 12'], correctIndex: 1 },
        { id: 'eva-2-q3', question: 'What is the order number?', options: ['SH-44729', 'SH-44927', 'SH-47249', 'SH-49247'], correctIndex: 0 },
      ],
    },
    {
      id: 'eva-3',
      scenario: 'Late Return Request',
      context: 'Customer asking for exception to return policy',
      audioScript: "I want to return this jacket but the return window closed two days ago. I've been sick and couldn't get to it in time. Is there anything you can do? The jacket is unworn with tags still on. I paid $180 for it. I can provide a doctor's note if needed. I just want store credit, not a full refund.",
      questions: [
        { id: 'eva-3-q1', question: 'How many days ago did the return window close?', options: ['One day', 'Two days', 'Three days', 'Five days'], correctIndex: 1 },
        { id: 'eva-3-q2', question: 'How much did the jacket cost?', options: ['$160', '$170', '$180', '$190'], correctIndex: 2 },
        { id: 'eva-3-q3', question: 'What does the customer want?', options: ['A full refund', 'Store credit', 'An exchange', 'A partial refund'], correctIndex: 1 },
      ],
    },
  ],

  'social-media-va': [
    {
      id: 'smva-1',
      scenario: 'New Client Social Media Inquiry',
      context: 'Small business owner needing Instagram help',
      audioScript: "Hi, I'm a small business owner and I need help with my Instagram. I post maybe once a week and I'm not getting any engagement. I sell handmade jewelry and I have about 800 followers. Can you help me grow my account? My budget is around $500 a month. I'd like to get to 5,000 followers by the end of the year.",
      questions: [
        { id: 'smva-1-q1', question: 'What does the client sell?', options: ['Handmade pottery', 'Handmade jewelry', 'Handmade candles', 'Handmade soap'], correctIndex: 1 },
        { id: 'smva-1-q2', question: 'How many followers does the client currently have?', options: ['About 500', 'About 800', 'About 1,000', 'About 1,200'], correctIndex: 1 },
        { id: 'smva-1-q3', question: 'What is the client monthly budget?', options: ['$300', '$400', '$500', '$600'], correctIndex: 2 },
      ],
    },
    {
      id: 'smva-2',
      scenario: 'Product Launch Coordination',
      context: 'Client needing multi-platform posts for launch',
      audioScript: "We have a product launch next Tuesday at 10 AM. I need posts ready for Instagram, Facebook, and Twitter. The copy needs to be punchy and the hashtags need to be researched. Can you handle this? The product is a new line of organic skincare. I also want an Instagram Story sequence and a Reel for the launch day.",
      questions: [
        { id: 'smva-2-q1', question: 'When is the product launch?', options: ['Monday at 9 AM', 'Tuesday at 10 AM', 'Wednesday at 11 AM', 'Thursday at 10 AM'], correctIndex: 1 },
        { id: 'smva-2-q2', question: 'How many platforms need posts?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 1 },
        { id: 'smva-2-q3', question: 'What type of product is being launched?', options: ['Organic food products', 'Organic skincare', 'Natural supplements', 'Eco-friendly clothing'], correctIndex: 1 },
      ],
    },
    {
      id: 'smva-3',
      scenario: 'Negative Comment Crisis',
      context: 'Negative comment gaining traction on post',
      audioScript: "Someone left a really nasty comment on our latest post about our customer service. It's getting likes and other people are piling on. What should we do? The post has about 2,000 likes and the negative comment has 150 likes already. We don't want to delete it and make it worse, but we also can't just ignore it.",
      questions: [
        { id: 'smva-3-q1', question: 'How many likes does the post have?', options: ['About 1,000', 'About 1,500', 'About 2,000', 'About 2,500'], correctIndex: 2 },
        { id: 'smva-3-q2', question: 'How many likes does the negative comment have?', options: ['50', '100', '150', '200'], correctIndex: 2 },
        { id: 'smva-3-q3', question: 'What does the client worry about if they delete the comment?', options: ['It will make things worse', 'It will violate platform rules', 'It will alert the commenter', 'It will reduce engagement'], correctIndex: 0 },
      ],
    },
  ],

  'bookkeeper': [
    {
      id: 'bk-1',
      scenario: 'Report Discrepancy Inquiry',
      context: 'Client questioning an unfamiliar line item',
      audioScript: "I have a question about my monthly financial report. There's a line item here for $2,400 that I don't recognize. It says 'office supplies' but I didn't buy that much. Can you look into it? The date on the transaction is October 3rd. I usually spend about $200 a month on supplies. This seems way off.",
      questions: [
        { id: 'bk-1-q1', question: 'How much is the unfamiliar line item?', options: ['$1,400', '$2,400', '$2,040', '$4,200'], correctIndex: 1 },
        { id: 'bk-1-q2', question: 'What category is the transaction listed under?', options: ['Office equipment', 'Office supplies', 'Software subscriptions', 'Consulting fees'], correctIndex: 1 },
        { id: 'bk-1-q3', question: 'How much does the client usually spend monthly on supplies?', options: ['About $100', 'About $200', 'About $300', 'About $400'], correctIndex: 1 },
      ],
    },
    {
      id: 'bk-2',
      scenario: 'Disorganized Client',
      context: 'Client behind on bookkeeping with shoebox of receipts',
      audioScript: "I'm behind on three months of bookkeeping and I'm feeling overwhelmed. I have a shoebox of receipts. Can you help me get caught up before tax season? I estimate there are probably 300 receipts in here. Some are faded and hard to read. I also have a few bank statements I haven't reconciled. I need this done by January 15th.",
      questions: [
        { id: 'bk-2-q1', question: 'How many months behind is the client?', options: ['One month', 'Two months', 'Three months', 'Four months'], correctIndex: 2 },
        { id: 'bk-2-q2', question: 'How many receipts does the client estimate?', options: ['About 200', 'About 250', 'About 300', 'About 350'], correctIndex: 2 },
        { id: 'bk-2-q3', question: 'When does the client need the bookkeeping done?', options: ['By December 15th', 'By January 1st', 'By January 15th', 'By February 1st'], correctIndex: 2 },
      ],
    },
    {
      id: 'bk-3',
      scenario: 'Cleanup and Review Request',
      context: 'Client worried about previous bookkeeper errors',
      audioScript: "I think my previous bookkeeper made some mistakes on last year's books. I'm worried about an audit. Can you review everything and fix what's wrong? The tax year in question is 2024. There are about 12 months of transactions to review. I've already noticed three entries that don't match my bank statements.",
      questions: [
        { id: 'bk-3-q1', question: 'What tax year is in question?', options: ['2022', '2023', '2024', '2025'], correctIndex: 2 },
        { id: 'bk-3-q2', question: 'How many months of transactions need review?', options: ['6 months', '9 months', '10 months', '12 months'], correctIndex: 3 },
        { id: 'bk-3-q3', question: 'How many entries has the client already noticed as wrong?', options: ['Two', 'Three', 'Four', 'Five'], correctIndex: 1 },
      ],
    },
  ],

  'data-entry': [
    {
      id: 'de-1',
      scenario: 'High-Volume Data Entry Task',
      context: 'Client needing 500 records entered by end of day',
      audioScript: "I have a spreadsheet with 500 customer records that need to be entered into our CRM by end of day. The formatting is inconsistent and some fields are missing. Can you handle this? The key fields are name, email, phone, company, and industry. Missing phone numbers should be marked as 'N/A'. I need this done by 5 PM today.",
      questions: [
        { id: 'de-1-q1', question: 'How many records need to be entered?', options: ['300', '400', '500', '600'], correctIndex: 2 },
        { id: 'de-1-q2', question: 'What should be done with missing phone numbers?', options: ['Leave them blank', "Mark them as 'N/A'", 'Skip the record', 'Flag for review'], correctIndex: 1 },
        { id: 'de-1-q3', question: 'When does the task need to be completed?', options: ['By noon today', 'By 3 PM today', 'By 5 PM today', 'By end of day tomorrow'], correctIndex: 2 },
      ],
    },
    {
      id: 'de-2',
      scenario: 'Data Migration Project',
      context: 'Client migrating 2000 product records to new system',
      audioScript: "We're migrating from our old system to a new database. I need all 2,000 product records transferred accurately. There are custom fields that need to be mapped correctly. The product categories are electronics, clothing, home goods, and accessories. Each record has about 15 fields. I need this done by the end of next week.",
      questions: [
        { id: 'de-2-q1', question: 'How many product records need to be transferred?', options: ['1,200', '1,500', '2,000', '2,500'], correctIndex: 2 },
        { id: 'de-2-q2', question: 'How many product categories are there?', options: ['Three', 'Four', 'Five', 'Six'], correctIndex: 1 },
        { id: 'de-2-q3', question: 'How many fields does each record have?', options: ['10', '12', '15', '20'], correctIndex: 2 },
      ],
    },
    {
      id: 'de-3',
      scenario: 'Error Discovery',
      context: 'Client found errors in previously entered data',
      audioScript: "I noticed some errors in the data you entered last week. Several customer phone numbers are wrong. We need to fix this before the marketing campaign goes out on Monday. I found about 25 records with incorrect phone numbers out of the 200 you entered. Can you go through them all and verify each number against the original source?",
      questions: [
        { id: 'de-3-q1', question: 'How many records have incorrect phone numbers?', options: ['About 15', 'About 20', 'About 25', 'About 30'], correctIndex: 2 },
        { id: 'de-3-q2', question: 'How many total records were entered?', options: ['100', '150', '200', '250'], correctIndex: 2 },
        { id: 'de-3-q3', question: 'When does the marketing campaign go out?', options: ['Friday', 'Saturday', 'Sunday', 'Monday'], correctIndex: 3 },
      ],
    },
  ],
};

export function getListeningScenarios(positionId: PositionId): ListeningScenario[] {
  return POSITION_LISTENING_SCENARIOS[positionId] ?? POSITION_LISTENING_SCENARIOS['general-va'];
}
