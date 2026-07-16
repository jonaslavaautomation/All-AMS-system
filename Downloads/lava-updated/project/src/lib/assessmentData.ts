export interface ListeningQuestion {
  id: string;
  audioScript: string;
  scenario: string;
  questions: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

export const LISTENING_EXERCISES: ListeningQuestion[] = [
  {
    id: 'l1',
    scenario: 'Insurance Customer Inquiry',
    audioScript:
      "Hi, I'm calling about my auto insurance policy number AX-4471. I recently moved to a new address in downtown Austin, and I wanted to check if my premium will change. Also, I'd like to add comprehensive coverage to my plan since I'm now parking on the street. Can you walk me through what that would cost per month and when the change would take effect?",
    questions: [
      {
        id: 'l1q1',
        question: 'What is the caller\'s policy number?',
        options: ['AX-4471', 'AX-4771', 'AX-4147', 'AX-7414'],
        correctIndex: 0,
      },
      {
        id: 'l1q2',
        question: 'Why is the caller contacting the insurance company?',
        options: [
          'To file a claim for an accident',
          'To update their address and add comprehensive coverage',
          'To cancel their policy',
          'To request a refund',
        ],
        correctIndex: 1,
      },
      {
        id: 'l1q3',
        question: 'Where does the caller now park their car?',
        options: ['In a private garage', 'On the street', 'At a friend\'s house', 'At a paid lot'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'l2',
    scenario: 'Upset Customer',
    audioScript:
      "This is the third time I've called about this billing error and nobody has fixed it! I was charged twice for my October premium — once on October 2nd for $147.50 and again on October 15th for the same amount. I've been a customer for six years and I'm seriously thinking about switching providers if this isn't resolved by the end of the week. I need that $147.50 refunded immediately.",
    questions: [
      {
        id: 'l2q1',
        question: 'How many times has the customer called about this issue?',
        options: ['Once', 'Twice', 'Three times', 'Four times'],
        correctIndex: 2,
      },
      {
        id: 'l2q2',
        question: 'What is the amount of the duplicate charge?',
        options: ['$147.50', '$174.50', '$147.15', '$417.50'],
        correctIndex: 0,
      },
      {
        id: 'l2q3',
        question: 'How long has the customer been with the company?',
        options: ['Three months', 'One year', 'Three years', 'Six years'],
        correctIndex: 3,
      },
    ],
  },
  {
    id: 'l3',
    scenario: 'Appointment Reminder',
    audioScript:
      "Hello, this is a reminder call from Dr. Patterson's dental office. Your appointment is scheduled for Thursday, November 14th at 2:30 PM. Please arrive 15 minutes early to complete your updated paperwork. If you need to reschedule, kindly call us at least 24 hours in advance. Our office number is 555-0182. Thank you and have a wonderful day.",
    questions: [
      {
        id: 'l3q1',
        question: 'What day is the appointment?',
        options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        correctIndex: 2,
      },
      {
        id: 'l3q2',
        question: 'What time is the appointment?',
        options: ['2:00 PM', '2:30 PM', '3:30 PM', '12:30 PM'],
        correctIndex: 1,
      },
      {
        id: 'l3q3',
        question: 'How early should the patient arrive?',
        options: ['5 minutes', '10 minutes', '15 minutes', '30 minutes'],
        correctIndex: 2,
      },
    ],
  },
  {
    id: 'l4',
    scenario: 'Agent Giving Instructions',
    audioScript:
      "Good morning team. Today's priority is following up on all claims filed before October 1st. I need each of you to pull a report from the dashboard, filter by status 'pending review', and reach out to the policyholders by phone before noon. Document every call in the CRM with the outcome and next steps. If a claim is over $10,000, escalate it to me directly before making any commitment to the customer. Any questions?",
    questions: [
      {
        id: 'l4q1',
        question: 'What is the team\'s priority for today?',
        options: [
          'Filing new claims',
          'Following up on claims filed before October 1st',
          'Calling new leads',
          'Training new agents',
        ],
        correctIndex: 1,
      },
      {
        id: 'l4q2',
        question: 'What filter should be applied to the report?',
        options: ['"approved"', '"pending review"', '"rejected"', '"in review"'],
        correctIndex: 1,
      },
      {
        id: 'l4q3',
        question: 'What should be done with claims over $10,000?',
        options: [
          'Approve immediately',
          'Escalate to the supervisor directly',
          'Reject them',
          'Send an email to the customer',
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'l5',
    scenario: 'Internal Meeting',
    audioScript:
      "Alright everyone, let's review the Q3 results. Our renewal rate climbed to 92%, which is a four-point improvement over last quarter. However, our new policy acquisition dropped by 8%, primarily due to increased competition in the Midwest region. For Q4, marketing will launch a targeted campaign in Ohio and Michigan starting November 1st. Customer service, I need your team to reduce average call handle time from 6.2 minutes to under 5 minutes by December.",
    questions: [
      {
        id: 'l5q1',
        question: 'What was the renewal rate for Q3?',
        options: ['88%', '90%', '92%', '96%'],
        correctIndex: 2,
      },
      {
        id: 'l5q2',
        question: 'By how much did new policy acquisition drop?',
        options: ['4%', '6%', '8%', '10%'],
        correctIndex: 2,
      },
      {
        id: 'l5q3',
        question: 'What is the target call handle time for Q4?',
        options: ['Under 4 minutes', 'Under 5 minutes', 'Under 6 minutes', 'Under 6.2 minutes'],
        correctIndex: 1,
      },
    ],
  },
  {
    id: 'l6',
    scenario: 'Voicemail',
    audioScript:
      "Hi, this message is for Mr. David Chen. My name is Sarah Williams, I'm calling from Global Insurance. I received your claim submission regarding the water damage in your kitchen on October 20th. I've reviewed your documentation and we're approving the claim for $3,250. A check will be mailed to your address on file within 7 to 10 business days. If you have any questions, please call me back at 1-800-555-0199, extension 42. Thank you and have a great day.",
    questions: [
      {
        id: 'l6q1',
        question: 'Who is the message for?',
        options: ['Sarah Williams', 'David Chen', 'Mr. Global', 'Mr. Patterson'],
        correctIndex: 1,
      },
      {
        id: 'l6q2',
        question: 'What type of damage was reported?',
        options: ['Fire damage', 'Water damage', 'Roof damage', 'Theft'],
        correctIndex: 1,
      },
      {
        id: 'l6q3',
        question: 'What is the approved claim amount?',
        options: ['$3,250', '$3,520', '$2,350', '$3,205'],
        correctIndex: 0,
      },
    ],
  },
];

export interface PronunciationSentence {
  id: string;
  text: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const PRONUNCIATION_SENTENCES: PronunciationSentence[] = [
  { id: 'p1', text: "Thank you for calling Global Insurance, how may I help you today?", category: 'Customer Greeting', difficulty: 'easy' },
  { id: 'p2', text: "Your liability coverage protects you if you are found legally responsible for damages.", category: 'Insurance Terminology', difficulty: 'medium' },
  { id: 'p3', text: "The deductible is the amount you pay out of pocket before your insurance kicks in.", category: 'Policy Explanation', difficulty: 'medium' },
  { id: 'p4', text: "I'd be happy to walk you through the claims process step by step over the phone.", category: 'Phone Script', difficulty: 'easy' },
  { id: 'p5', text: "Comprehensive coverage pays for damage to your vehicle caused by events other than a collision.", category: 'Insurance Terminology', difficulty: 'hard' },
  { id: 'p6', text: "Would you like me to schedule a follow-up call with one of our licensed agents next Tuesday?", category: 'Phone Script', difficulty: 'medium' },
  { id: 'p7', text: "Your premium may increase upon renewal if there have been any at-fault claims in the past three years.", category: 'Policy Explanation', difficulty: 'hard' },
  { id: 'p8', text: "I completely understand your concern and I'm here to help resolve this for you.", category: 'Customer Greeting', difficulty: 'easy' },
];

export interface ReadingParagraph {
  id: string;
  text: string;
  title: string;
}

export const READING_PARAGRAPHS: ReadingParagraph[] = [
  {
    id: 'r1',
    title: 'Welcome Message',
    text: "Good morning, and thank you for choosing Global Insurance. My name is Alex, and I'll be your dedicated account specialist. Our company has been providing reliable coverage to families across the country for over thirty years. I'm here to answer any questions you may have and to make sure you get the most out of your policy. Whether you're calling about an existing claim, a billing question, or simply want to explore additional coverage options, I'm happy to help.",
  },
  {
    id: 'r2',
    title: 'Claims Process',
    text: "Filing a claim with us is straightforward. First, you'll want to gather any relevant documentation, including photos, receipts, and a written description of the incident. Once you have those ready, you can submit your claim online through our portal, or you can call our claims department directly. A dedicated adjuster will be assigned to your case within forty-eight hours, and they'll be your point of contact throughout the entire process.",
  },
  {
    id: 'r3',
    title: 'Policy Renewal',
    text: "Your policy is set to renew automatically on the first of next month. We'll send you a renewal notice by email and mail at least thirty days in advance, outlining any changes to your coverage or premium. If you'd like to make adjustments before the renewal date, now is the perfect time. You can add or remove drivers, update your deductible, or explore discounts you may be eligible for, such as the safe driver discount or the multi-policy bundle.",
  },
];

export const CONVERSATION_QUESTIONS = [
  "Tell me a little bit about yourself and your background.",
  "Describe your previous work experience and what you enjoyed most about it.",
  "Tell me about a time you handled a difficult customer situation. What happened and how did you resolve it?",
  "How do you prioritize your tasks when you have multiple urgent deadlines?",
  "Why should we hire you for this Virtual Assistant position?",
  "What would you do if an angry customer called and started yelling at you?",
];

export interface RoleplayScenario {
  id: string;
  title: string;
  role: string;
  emotion: 'angry' | 'frustrated' | 'confused' | 'polite' | 'anxious';
  systemPrompt: string;
  openingLine: string;
  context: string;
}

export const ROLEPLAY_SCENARIOS: RoleplayScenario[] = [
  {
    id: 'rp1',
    title: 'Angry Customer - Missed Payment',
    role: 'Customer',
    emotion: 'angry',
    systemPrompt: "You are an angry customer whose insurance policy was cancelled due to a missed payment that you believe was the company's fault. You are upset and want your policy reinstated immediately without penalty. Be confrontational but not abusive.",
    openingLine: "I can't believe you people cancelled my policy! I sent that payment in on time and your system lost it, and now you're telling me I have to reapply? This is unacceptable!",
    context: 'The customer claims they made a payment that was not posted to their account, resulting in cancellation. Determine if a grace-period reinstatement is possible.',
  },
  {
    id: 'rp2',
    title: 'Insurance Renewal Inquiry',
    role: 'Customer',
    emotion: 'confused',
    systemPrompt: "You are a confused customer who received a renewal notice with a premium increase. You don't understand why your rate went up and you want a clear explanation. Be polite but persistent.",
    openingLine: "Hi, I just got my renewal notice and my premium went up by almost thirty dollars a month. I haven't had any accidents or tickets, so I don't understand why my rate increased. Can you explain?",
    context: 'Explain the factors behind the rate increase (industry-wide adjustments, regional trends) and explore discounts to offset the change.',
  },
  {
    id: 'rp3',
    title: 'Billing Concern',
    role: 'Customer',
    emotion: 'frustrated',
    systemPrompt: "You are a frustrated customer who was double-billed for your monthly premium. You have already called once and the issue was not resolved. You want a refund and an explanation.",
    openingLine: "I'm calling back about that double charge I reported last week. I still haven't seen a refund and I'm getting pretty frustrated. What's going on with my account?",
    context: 'Apologize for the previous failed resolution, verify the duplicate charge, process the refund, and confirm the timeline.',
  },
  {
    id: 'rp4',
    title: 'Policy Cancellation Request',
    role: 'Customer',
    emotion: 'polite',
    systemPrompt: "You are a polite customer who wants to cancel your policy because you found a cheaper rate elsewhere. You're not angry, just firm in your decision. Be open to hearing retention offers.",
    openingLine: "Hi there, I'm calling because I'd like to cancel my auto insurance policy. I found a better rate with another company and I'd like to switch. Can you help me with that?",
    context: 'Process the cancellation request professionally, ask for feedback, and offer a retention discount if the customer is open to it.',
  },
  {
    id: 'rp5',
    title: 'Cold Calling - Lead Generation',
    role: 'Prospect',
    emotion: 'anxious',
    systemPrompt: "You are a prospect receiving a cold call about home insurance. You're a bit anxious because you weren't expecting the call, but you're willing to listen if the agent is respectful and clear. Ask questions about coverage and price.",
    openingLine: "Hello? Uh, yes, this is she. I wasn't expecting a call — what is this about exactly?",
    context: 'Introduce yourself and the company, explain the value proposition clearly, and invite the prospect to a follow-up appointment.',
  },
  {
    id: 'rp6',
    title: 'Appointment Setting',
    role: 'Prospect',
    emotion: 'polite',
    systemPrompt: "You are a prospect who showed interest in a quote. You're polite but busy, and you need to schedule a call with a licensed agent. Be cooperative but specific about your availability.",
    openingLine: "Sure, I'd be happy to set up a time to talk. I work during the day though, so it would have to be in the evening or on the weekend. What times do you have available?",
    context: 'Offer available appointment slots, confirm the prospect\'s contact details, and send a calendar invitation.',
  },
  {
    id: 'rp7',
    title: 'Claims Follow-up',
    role: 'Customer',
    emotion: 'anxious',
    systemPrompt: "You are an anxious customer following up on a claim you filed two weeks ago. You haven't heard anything and you're worried it was denied. Ask for an update and reassurance.",
    openingLine: "Hi, I filed a claim about two weeks ago for some water damage in my kitchen and I haven't heard anything back. I'm starting to get worried — can you check on the status for me?",
    context: 'Look up the claim, provide a clear status update, set expectations for next steps, and reassure the customer.',
  },
];

export interface NoteTakingExercise {
  id: string;
  title: string;
  audioScript: string;
  keyPoints: string[];
}

export const NOTE_TAKING_EXERCISES: NoteTakingExercise[] = [
  {
    id: 'n1',
    title: 'Policy Update Call',
    audioScript:
      "Hi, this is Jamie from Summit Insurance calling about your homeowner's policy. We're updating our records and I wanted to confirm a few details. Your current coverage limit is $450,000 with a $1,000 deductible. Your policy renews on March 15th, and your new annual premium will be $1,280, which is a slight increase of $45 from last year. You're currently eligible for a loyalty discount of 12% since you've been with us for over five years. Would you like to add flood coverage for an additional $18 per month?",
    keyPoints: [
      'coverage limit $450,000',
      'deductible $1,000',
      'renewal date March 15th',
      'annual premium $1,280',
      'increase of $45',
      'loyalty discount 12%',
      'five years with company',
      'flood coverage option $18/month',
    ],
  },
  {
    id: 'n2',
    title: 'Claim Details',
    audioScript:
      "I'm calling to report an accident that happened yesterday at approximately 3:45 PM at the intersection of Main Street and Oak Avenue. I was driving north on Main when a vehicle ran a red light and hit the front passenger side of my car. The other driver's name is Robert Martinez, license plate number 7-ABC-421, and his insurance provider is Statewide Mutual, policy number SM-88210. There were no injuries, but my car will need significant body work. A police report was filed, report number 2024-1156.",
    keyPoints: [
      'accident at 3:45 PM',
      'Main Street and Oak Avenue',
      'driving north on Main',
      'other driver ran red light',
      'front passenger side hit',
      'other driver Robert Martinez',
      'license plate 7-ABC-421',
      'Statewide Mutual insurance',
      'policy SM-88210',
      'no injuries',
      'police report 2024-1156',
    ],
  },
  {
    id: 'n3',
    title: 'New Customer Onboarding',
    audioScript:
      "Welcome to the family! I've set up your new auto insurance policy, effective Monday, December 2nd. Your policy number is GL-99284. You've chosen the full coverage plan with a $500 deductible and your monthly premium is $142. I've also enrolled you in our paperless billing program, so you'll receive your statements via email at the address on file. Your first payment of $142 is due on December 10th, and after that, your billing cycle will be the 10th of every month. You can reach our 24/7 claims hotline at 1-800-555-0200.",
    keyPoints: [
      'effective December 2nd',
      'policy number GL-99284',
      'full coverage plan',
      '$500 deductible',
      'monthly premium $142',
      'paperless billing',
      'statements via email',
      'first payment December 10th',
      'billing cycle 10th of every month',
      '24/7 claims hotline 1-800-555-0200',
    ],
  },
];

export interface InsuranceTopic {
  id: string;
  topic: string;
  prompt: string;
  keyTerms: string[];
}

export const INSURANCE_TOPICS: InsuranceTopic[] = [
  {
    id: 'i1',
    topic: 'Liability Coverage',
    prompt: "A customer calls and asks: 'What does liability coverage actually cover?' Please explain liability coverage in simple, friendly terms.",
    keyTerms: ['liability', 'at fault', 'bodily injury', 'property damage', 'legal responsibility'],
  },
  {
    id: 'i2',
    topic: 'Deductible',
    prompt: "A customer asks: 'Can you explain what a deductible is and how it works?' Please provide a clear explanation with an example.",
    keyTerms: ['deductible', 'out of pocket', 'claim', 'premium', 'before coverage'],
  },
  {
    id: 'i3',
    topic: 'Comprehensive Coverage',
    prompt: "A customer asks: 'What is comprehensive coverage and do I need it?' Please explain what comprehensive coverage includes.",
    keyTerms: ['comprehensive', 'non-collision', 'theft', 'vandalism', 'natural disaster', 'falling objects'],
  },
  {
    id: 'i4',
    topic: 'Collision Coverage',
    prompt: "A customer asks: 'What is the difference between collision and comprehensive coverage?' Please explain collision coverage clearly.",
    keyTerms: ['collision', 'accident', 'another vehicle', 'object', 'repair or replace'],
  },
  {
    id: 'i5',
    topic: 'Umbrella Policy',
    prompt: "A customer asks: 'My agent mentioned an umbrella policy. What is that and should I consider one?' Please explain umbrella policies.",
    keyTerms: ['umbrella', 'extra liability', 'beyond standard limits', 'lawsuit', 'assets', 'additional protection'],
  },
  {
    id: 'i6',
    topic: 'Homeowners Insurance',
    prompt: "A new homeowner calls and asks: 'What does homeowners insurance typically cover?' Please walk them through the main coverages.",
    keyTerms: ['dwelling', 'personal property', 'liability', 'additional living expenses', 'perils', 'replacement cost'],
  },
];

export const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'sort of', 'kind of', 'hmm', 'er', 'ah'];
