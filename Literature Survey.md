# Literature Survey

## 1. Introduction

Digital technologies have increasingly been used to improve communication between citizens and local authorities. Civic issue reporting platforms allow citizens to report problems such as potholes, damaged roads, waste accumulation, broken streetlights, drainage problems, and other public infrastructure issues.

Research in this area focuses on several related concepts:

* Citizen participation
* Crowdsourced civic reporting
* Location-based issue reporting
* Digital government services
* Public feedback
* Issue tracking and resolution
* Transparency and accountability
* Data-driven civic management

The literature reviewed for CivicVoice was selected to understand existing approaches, their strengths and limitations, and the areas that can be considered while designing the proposed platform.

---

# 2. Review of Existing Research

## 2.1 A Web & Mobile City Maintenance Reporting Solution

**Authors:** Maria da Conceição, João Varajão, and others
**Year:** 2013
**Publication:** Procedia Technology

This research proposes a web and mobile solution for reporting non-emergency urban problems. The system allows citizens to report problems through web browsers or mobile devices using a location-based environment. Citizens can also provide multimedia information as evidence of the reported problem.

The research demonstrates how mobile and web technologies can be used to improve citizen participation in city maintenance and help local authorities receive structured information about urban problems.

### Key contributions

* Location-based civic reporting
* Citizen participation
* Multimedia evidence
* Digital management of urban maintenance reports
* Communication between citizens and responsible authorities

### Relevance to CivicVoice

This work directly supports the idea of allowing citizens to submit civic issues together with their location and evidence.

CivicVoice can build upon this concept by providing a more complete issue lifecycle, including community support, progress tracking, completion evidence, and citizen verification.

---

## 2.2 FixMyStreet Brussels: Socio-Demographic Inequality in Crowdsourced Civic Participation

**Authors:** Burak Pak, Alvin Chua, Andrew Vande Moere
**Year:** 2017
**Publication:** Journal of Urban Technology

This study analyzed the use of FixMyStreet in Brussels, a platform that allows citizens to report environmental problems such as potholes and damaged pavements to government authorities.

The researchers analyzed more than 30,000 reports and found significant differences in civic participation between districts. Their findings suggested that crowdsourced civic participation platforms may underrepresent or marginalize participation from some lower-income and ethnically diverse communities.

### Key contributions

* Analysis of real-world civic reporting data
* Location-based civic participation analysis
* Study of demographic differences in participation
* Identification of inclusivity challenges

### Relevance to CivicVoice

This research highlights that simply providing a digital reporting platform does not guarantee equal participation.

CivicVoice should therefore consider:

* Simple user interfaces
* Accessible design
* Clear reporting workflows
* Avoiding unnecessary technical complexity
* Designing features that do not depend entirely on highly active users

Inclusivity should be considered during the UI/UX design phase.

---

## 2.3 Public Crowdsourcing: Analyzing the Role of Government Feedback on Civic Digital Platforms

**Authors:** Lisa Schmidthuber, Dennis Hilgers, Krithika Randhawa
**Year:** 2022
**Publication:** Public Administration

This study investigates how government responses to citizen requests influence continued participation on civic digital platforms. The researchers analyzed a seven-year dataset containing citizen requests and government responses.

The study found that the nature and reasoning of government responses can influence whether citizens continue participating. In particular, transparent explanations for rejected requests were found to be important for sustaining citizen participation.

### Key contributions

* Importance of government feedback
* Relationship between responsiveness and citizen participation
* Importance of transparent explanations
* Long-term analysis of citizen-government interaction

### Relevance to CivicVoice

This research is highly relevant to CivicVoice's issue lifecycle.

Simply displaying:

```text
Rejected
```

does not provide sufficient information to citizens.

CivicVoice can instead provide:

Issue Status
      ↓
Reason for Decision
      ↓
Authority Update
      ↓
Progress Information


This supports the idea that CivicVoice should focus not only on **reporting problems**, but also on **what happens after a problem is reported**.

---

## 2.4 Traffy Fondue: A Smart City Citizen Engagement

**Authors:** Michael Motet Hansen and Bharat Dahiya
**Year:** 2025
**Publication:** Frontiers in Sustainable Cities

This research examines Traffy Fondue, a digital platform used in Bangkok to facilitate citizen reporting and resolution of urban problems.

The platform enables citizens to report problems such as damaged roads, traffic problems, flooding, and waste-related issues. The study examined platform data and stakeholder interviews to understand factors contributing to successful citizen participation in smart-city initiatives.

The research highlights the importance of citizen feedback and the interaction between citizens and city administrators. It reports high satisfaction among users and identifies feedback and responsiveness as important factors in the platform's success.

### Key contributions

* Real-world civic issue reporting
* Citizen-government interaction
* Feedback mechanisms
* Data-driven urban management
* Smart-city applications
* Large-scale civic participation

### Relevance to CivicVoice

Traffy Fondue demonstrates that civic issue reporting can become part of a broader smart-city ecosystem.

CivicVoice can adopt the concept of a structured reporting and feedback loop while focusing on a simpler, educational, and scalable platform architecture suitable for the project.

---

## 2.5 Dog Fouling and Potholes: Understanding the Role of Coproducing "Citizen Sensors" in Local Governance

**Year:** 2022
**Platform studied:** FixMyStreet

This research investigates how citizens act as "sensors" by digitally reporting problems in public spaces.

The study uses FixMyStreet data from across the United Kingdom and examines relationships between citizen reporting, neighborhood characteristics, infrastructure, and deprivation.

The research highlights that citizen-generated reports can provide valuable information about local conditions, but participation patterns are not necessarily uniform across different communities.

### Key contributions

* Citizen-generated urban data
* Digital reporting of public problems
* Relationship between infrastructure and reporting
* Participation inequality

### Relevance to CivicVoice

This research supports the idea of treating citizen reports as a source of useful information about local civic conditions.

For CivicVoice, aggregated issue data could eventually help identify:

* Frequently reported issue categories
* Problem hotspots
* Areas with recurring infrastructure problems
* Trends over time

---

## 2.6 CrowDSL: Platform for Incidents Management in a Smart City Context

**Publication:** MDPI
**Year:** 2021

CrowDSL examines an incident-management platform in a smart-city context. The research discusses systems where users submit incident reports containing descriptions and location information.

The paper also examines FixMyStreet, highlighting its ability to allow citizens to report, view, discuss, and track local problems and their resolution. It also notes the use of follow-up mechanisms to determine whether reported problems were actually fixed.

### Key contributions

* Incident reporting
* Location information
* Citizen-generated reports
* Issue tracking
* Resolution monitoring
* Follow-up with citizens

### Relevance to CivicVoice

The concept of checking whether a reported issue was actually resolved is particularly relevant to CivicVoice.

It supports our proposed idea of a **citizen verification stage** rather than considering an issue permanently resolved simply because an administrator marked it as completed.

---

## 2.7 Recent Research on Civic Issue Reporting and Resolution

Recent research continues to explore crowdsourced civic issue reporting and resolution systems.

A 2026 study proposed a system in which citizens report infrastructure problems using images, descriptions, and live location, while authorities manage reports through an administrative dashboard and update statuses such as Pending, In Progress, and Resolved.

Another 2026 study explored AI-assisted civic issue reporting using image classification, natural-language processing, geolocation, duplicate detection, and administrative dashboards.

These recent works demonstrate that civic issue platforms are evolving from simple complaint forms toward more structured and intelligent systems.

### Relevance to CivicVoice

These studies support several planned CivicVoice features:

* Image-based evidence
* Location-based reporting
* Issue categorization
* Issue prioritization
* Duplicate detection
* Administrative dashboards
* AI-assisted analysis

However, CivicVoice will initially focus on building a reliable core platform before introducing AI features.

---

# 3. Comparative Analysis

| Research / Platform                 | Location | Evidence | Citizen Participation | Status Tracking | Government Feedback | Citizen Verification | Analytics / AI      |
| ----------------------------------- | -------- | -------- | --------------------- | --------------- | ------------------- | -------------------- | ------------------- |
| City Maintenance Reporting Solution | ✓        | ✓        | ✓                     | Partial         | ✓                   | -                    | Limited             |
| FixMyStreet                         | ✓        | ✓        | ✓                     | ✓               | ✓                   | Follow-up            | Data-based          |
| Public Crowdsourcing Study          | ✓        | -        | ✓                     | ✓               | ✓                   | -                    | Research-focused    |
| Traffy Fondue                       | ✓        | ✓        | ✓                     | ✓               | ✓                   | Feedback             | Data-driven         |
| CrowDSL                             | ✓        | ✓        | ✓                     | ✓               | ✓                   | ✓                    | Smart-city oriented |
| Recent AI Civic Systems             | ✓        | ✓        | ✓                     | ✓               | ✓                   | -                    | ✓                   |
| **CivicVoice**                      | **✓**    | **✓**    | **✓**                 | **✓**           | **✓**               | **Planned ✓**        | **Future ✓**        |

The comparison indicates that many existing systems already provide important components of civic issue reporting.

Therefore, CivicVoice should not claim that location-based civic reporting itself is a new concept.

Instead, the project focuses on combining relevant concepts into a coherent platform and exploring improvements in the citizen experience, transparency, community support, issue lifecycle, and verification process.

---

# 4. Research Gap

The literature demonstrates that several important aspects of civic issue management have already been studied and implemented.

Existing systems have successfully explored:

* Location-based reporting
* Citizen-generated civic data
* Multimedia evidence
* Government response
* Issue status tracking
* Crowdsourced participation
* Smart-city analytics

However, the reviewed literature also highlights several challenges.

### 4.1 Transparency

Research on government feedback demonstrates that citizens care about how their requests are handled and why decisions are made.

Therefore, a civic platform should provide more than a simple status such as "Rejected" or "Completed."

---

### 4.2 Verification of Resolution

An administrative status of "Completed" does not necessarily guarantee that the original problem has actually disappeared.

This motivates a workflow where citizens can provide feedback or verify the reported resolution.

---

### 4.3 Community Support

Many civic reporting systems primarily treat each report as an individual complaint.

CivicVoice proposes exploring a community-support mechanism where citizens can support an existing issue instead of repeatedly submitting the same problem.

This can potentially help identify issues affecting larger groups of citizens.

---

### 4.4 Inclusivity

Research on FixMyStreet demonstrates that participation can vary significantly between communities.

Therefore, CivicVoice should prioritize:

* Simple reporting
* Clear navigation
* Accessible interfaces
* Minimal unnecessary steps
* Responsive design

---

### 4.5 Unified Issue Lifecycle

The literature contains many examples of reporting and tracking, but CivicVoice aims to explicitly model the complete lifecycle:

Report
  ↓
Review
  ↓
Accept
  ↓
Prioritize
  ↓
In Progress
  ↓
Completion Evidence
  ↓
Citizen Verification
  ↓
Resolved / Reopened


This lifecycle will be investigated and refined during the system-design phase.

---

# 5. Proposed Contribution of CivicVoice

Based on the literature survey, CivicVoice will explore a combination of the following concepts:

1. **Location-based civic issue reporting**
2. **Photographic and multimedia evidence**
3. **Community support for existing issues**
4. **Structured issue lifecycle**
5. **Transparent progress updates**
6. **Completion evidence**
7. **Citizen verification**
8. **Location-based search and discovery**
9. **Administrative monitoring**
10. **Civic analytics**
11. **Optional AI-assisted features**

The project is therefore positioned as an educational implementation and exploration of established civic-engagement concepts rather than claiming to invent a completely new civic reporting model.

---

# 6. Conclusion

The literature shows that digital civic-reporting platforms can improve communication between citizens and authorities by providing structured information about public problems.

Research on systems such as FixMyStreet demonstrates the usefulness of crowdsourced, location-based civic reporting, while studies of government feedback show the importance of transparent responses and continued communication. Traffy Fondue provides a recent example of large-scale citizen participation in urban issue reporting and resolution.

The literature also identifies important challenges, including unequal participation, management of large volumes of reports, and the need for effective feedback mechanisms.

CivicVoice will use these findings as a foundation for designing a platform focused on **reporting, community participation, transparent progress tracking, and verification of civic issue resolution**.

Future work may investigate AI-assisted categorization, duplicate detection, prioritization, and analytics after the core platform has been implemented and evaluated.

---

# 7. References

1. Cruz-Cunha, M. M., et al. (2013). *A Web & Mobile City Maintenance Reporting Solution*. Procedia Technology, 9, 226–235.

2. Pak, B., Chua, A., & Vande Moere, A. (2017). *FixMyStreet Brussels: Socio-Demographic Inequality in Crowdsourced Civic Participation*. Journal of Urban Technology, 24(2), 65–87.

3. Schmidthuber, L., Hilgers, D., & Randhawa, K. (2022). *Public Crowdsourcing: Analyzing the Role of Government Feedback on Civic Digital Platforms*. Public Administration, 100(4), 960–977.

4. Hansen, M. M., & Dahiya, B. (2025). *Traffy Fondue: A Smart City Citizen Engagement*. Frontiers in Sustainable Cities, 7.

5. *Dog Fouling and Potholes: Understanding the Role of Coproducing "Citizen Sensors" in Local Governance*. (2022). Local Government Studies.

6. *CrowDSL: Platform for Incidents Management in a Smart City Context*. (2021). MDPI.

7. Pawar, S., Sargar, V., Shinde, S., Kachare, J., & Jadhav, A. (2026). *Crowdsourced Civic Issues Reporting and Resolution System*. International Research Journal on Advanced Engineering Hub, 4(6), 4268–4273.

8. Cristescu, M. P. (2026). *English-Normalized Text and Topic Analytics for FixMyStreet Brussels: Spatio-Temporal Hotspot Detection and Decision Support from Citizen Reports*. Systems, 14(7), 763.
