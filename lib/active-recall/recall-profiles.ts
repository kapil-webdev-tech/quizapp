export const RECALL_PROFILES = [
  {
    id: "general",
    label: "General Revision",
    prompt: `
Generate balanced Active Recall questions strictly from the provided study material.

Prioritize:
• Complete topic coverage
• Core concepts
• Definitions
• Processes
• Examples
• Formulae
• Classifications
• Comparisons
• Advantages & Disadvantages
• Causes & Effects
• Applications
• Important facts
• Exceptions
• Commonly confused concepts

Convert every important idea into recall questions instead of summaries.

Cover the entire content while prioritizing high-yield concepts.
`,
  },

  {
    id: "upsc_prelims",
    label: "UPSC Prelims",
    prompt: `
Generate Active Recall questions exactly as expected in UPSC Civil Services Prelims.

While staying strictly within the provided material, prioritize concepts that have high probability of appearing in UPSC Prelims based on PYQ trends.

Give special importance to:

• Constitutional Articles
• Schedules
• Amendments
• Acts
• Committees
• Commissions
• Reports
• Constitutional & Statutory Bodies
• Government Schemes
• Important Years
• Important Personalities
• Definitions
• Exceptions
• Important facts
• Environment
• Geography
• Economy
• Science & Technology
• Mapping
• International Organisations

Wherever possible create:

• Statement-based recall
• True/False style recall
• Frequently confused facts
• Similar sounding concepts
• Comparison-based questions
• Elimination-friendly facts
• Frequently repeated PYQ themes

Think like a UPSC paper setter while selecting important concepts.
`,
  },

  {
    id: "upsc_mains",
    label: "UPSC Mains",
    prompt: `
Generate analytical Active Recall questions suitable for UPSC Mains.

Focus on concepts that help in answer writing.

Prioritize:

• Definitions
• Conceptual understanding
• Causes
• Effects
• Challenges
• Criticism
• Reforms
• Way Forward
• Examples
• Case Studies
• Data
• Reports
• Committees
• Judgments

Generate recall covering multiple dimensions wherever applicable:

• Political
• Social
• Economic
• Ethical
• Environmental
• Administrative
• International

Focus on conceptual clarity rather than factual memorization.
`,
  },

  {
    id: "ras_prelims",
    label: "RAS Prelims",
    prompt: `
Generate Active Recall questions suitable for Rajasthan Administrative Services Prelims.

While staying within the provided material, prioritize Rajasthan-specific facts.

Focus on:

• Rajasthan History
• Art & Culture
• Geography
• Economy
• Administration
• Panchayati Raj
• Government Schemes
• Districts
• Rivers
• Lakes
• Dams
• Wildlife
• Tribes
• Architecture
• Important Personalities
• Festivals

Generate:

• One-liner factual recall
• Statement-based recall
• Frequently repeated PYQ themes
• Frequently confused Rajasthan facts
• Comparison-based recall

Think like an RPSC paper setter.
`,
  },

  {
    id: "ras_mains",
    label: "RAS Mains",
    prompt: `
Generate descriptive Active Recall questions suitable for Rajasthan Administrative Services Mains.

Prioritize:

• Conceptual understanding
• Rajasthan Perspective
• Governance
• Social Issues
• Economic Issues
• Administrative Issues
• Environmental Issues

Include recall related to:

• Causes
• Impacts
• Challenges
• Government Initiatives
• Best Practices
• Case Studies
• Constitutional linkage
• Way Forward

Generate questions that improve answer-writing ability.
`,
  },

  {
    id: "vdo",
    label: "VDO",
    prompt: `
Generate simple and high-scoring Active Recall questions suitable for Village Development Officer examination.

Prioritize:

• Rural Development
• Panchayati Raj
• Agriculture
• Animal Husbandry
• Rajasthan GK
• Government Schemes
• Computer Basics
• Science
• Reasoning
• Basic Mathematics

Generate mostly:

• Direct factual recall
• Definitions
• Full Forms
• PYQ-oriented facts
• Frequently confused concepts
• One-liner revision questions

Keep questions simple and quick to revise.
`,
  },

  {
    id: "patwari",
    label: "Patwari",
    prompt: `
Generate straightforward Active Recall questions suitable for Rajasthan Patwari examination.

Prioritize:

• Rajasthan GK
• Geography
• History
• Revenue Administration
• Land Records
• Agriculture
• Soil
• Irrigation
• Crops
• Government Schemes
• Computer Basics
• Mathematics
• Reasoning

Generate:

• Frequently repeated PYQ-style facts
• One-liner recall
• Definitions
• District-wise facts
• Full Forms
• Common exam traps
• Important dates

Keep questions short, factual and scoring-oriented.
`,
  },
];