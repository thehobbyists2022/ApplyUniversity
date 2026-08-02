export const ATHLETIC_GUIDE = {
  title: "NCAA Athletic Recruiting & College Sports Guide",
  subtitle: "How to use high school sports performance to get recruited and earn college athletic scholarships",
  divisions: [
    {
      name: "NCAA Division I (D1)",
      description: "Highest level of collegiate athletics with full or partial athletic scholarships, massive media coverage, and intense training schedules.",
      scholarships: "Full-ride or Partial Athletic Scholarships available",
      commitment: "30-40 hours/week (pro-level commitment)"
    },
    {
      name: "NCAA Division II (D2)",
      description: "High level of competitive sports balancing athletics and academics with partial athletic scholarships.",
      scholarships: "Equivalency Athletic Scholarships (Partial Aid)",
      commitment: "20-25 hours/week"
    },
    {
      name: "NCAA Division III (D3) & Ivy League",
      description: "Focuses on academic excellence and student-athlete balance. No athletic scholarships, but strong need-based & merit aid.",
      scholarships: "No Athletic Scholarships (Generous Academic/Financial Aid)",
      commitment: "15-20 hours/week"
    }
  ],
  recruitingSteps: [
    {
      step: "1. Register with NCAA Eligibility Center",
      details: "Create an account on eligibilitycenter.org by Grade 10 to ensure high school core course compliance.",
      url: "https://web3.ncaa.org/ecwr3/"
    },
    {
      step: "2. Build a Highlight Reel & Athletic Resume",
      details: "Create a 3-5 minute video on platforms like Hudl or YouTube showcasing game highlights, stats, and physical specs.",
      url: "https://www.hudl.com"
    },
    {
      step: "3. Direct Email Outreach to College Coaches",
      details: "Email head/assistant college coaches with personalized cover letters, GPA, video link, and upcoming tournament schedule."
    },
    {
      step: "4. Attend Showcase Camps & Tournaments",
      details: "Participate in regional summer showcase camps where college coaches actively scout talent."
    },
    {
      step: "5. Unofficial & Official Campus Visits",
      details: "Take campus tours (Official visits are coach-funded in Senior year) to meet the team and tour training facilities."
    },
    {
      step: "6. Sign National Letter of Intent (NLI)",
      details: "Formally commit to the college athletic program and accept the athletic scholarship agreement.",
      url: "http://www.nationalletter.org"
    }
  ]
};

export const SCHOLARSHIP_GUIDE = {
  title: "US College Scholarships & Financial Aid Guide",
  subtitle: "Demystifying FAFSA, CSS Profile, Need-Based Aid, and Merit Scholarships for families",
  aidTypes: [
    {
      type: "Need-Based Financial Aid",
      source: "Federal / State / University",
      form: "FAFSA + CSS Profile",
      description: "Based on family income and assets. Top private universities (e.g. Stanford, Ivy League, Williams) guarantee 100% demonstrated financial need with NO loans for families earning under $100,000/yr.",
      url: "https://studentaid.gov/h/apply-for-aid/fafsa"
    },
    {
      type: "Merit-Based Scholarships",
      source: "Universities & Endowments",
      form: "Automatic with College Application or Special Essay",
      description: "Awarded based on GPA, SAT/ACT scores, leadership, or specialized talents regardless of family income. Common at public flagships (e.g. UMich, UF, Purdue, UT Austin)."
    },
    {
      type: "Athletic Scholarships",
      source: "NCAA D1 / D2 Athletic Departments",
      form: "NCAA Coach Agreement",
      description: "Awarded by college sports coaches for athletic recruitment.",
      url: "https://www.ncaa.org/sports/2014/10/6/scholarships.aspx"
    },
    {
      type: "External & Private Scholarships",
      source: "Foundations & Corporations (e.g. Coca-Cola, Gates)",
      form: "Individual Online Applications",
      description: "Private awards from $1,000 to $50,000/yr that can be applied to any college."
    }
  ],
  keyDeadlines: [
    { name: "FAFSA (Free Application for Federal Student Aid)", date: "Opens Oct 1 (Submit ASAP)", url: "https://studentaid.gov" },
    { name: "CSS Profile (For Private Colleges Financial Aid)", date: "Opens Oct 1 (Align with ED/EA deadlines)", url: "https://cssprofile.collegeboard.org" },
    { name: "Priority University Merit Scholarship Deadlines", date: "Nov 1 - Dec 1" },
    { name: "National Private Scholarship Deadlines", date: "Dec 15 - March 1" }
  ],
  scholarshipPlatforms: [
    { name: "College Board BigFuture Scholarships", desc: "Official scholarship search connected to SAT/PSAT.", url: "https://bigfuture.collegeboard.org/pay-for-college/scholarship-search" },
    { name: "Fastweb & Bold.org", desc: "No-essay and topic-based external scholarship databases.", url: "https://www.fastweb.com" },
    { name: "Niche Scholarships", desc: "Easy one-click monthly scholarship draws.", url: "https://www.niche.com/colleges/scholarships/" }
  ]
};
