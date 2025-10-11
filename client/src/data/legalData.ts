export interface LegalSection {
  title: string;
  content: string[];
}

export interface LegalData {
  lastUpdated: string;
  sections: LegalSection[];
}

export const termsData: LegalData = {
  lastUpdated: "January 11, 2025",
  sections: [
    {
      title: "1. Acceptance of Terms",
      content: [
        "By accessing and using S.T.A.R.T. (Secure, Trustworthy, And Real Ties), you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to these Terms of Service, please do not use our service.",
        "We reserve the right to update and change the Terms of Service from time to time without notice. Any new features that augment or enhance the current service shall be subject to the Terms of Service.",
      ],
    },
    {
      title: "2. Account Terms",
      content: [
        "You must be 18 years or older to use this service.",
        "You must provide your legal full name, a valid email address, and any other information requested in order to complete the signup process.",
        "You are responsible for maintaining the security of your account and password.",
        "You may not use the service for any illegal or unauthorized purpose.",
        "You must not, in the use of the service, violate any laws in your jurisdiction.",
        "One person or legal entity may not maintain more than one free account.",
      ],
    },
    {
      title: "3. User Conduct",
      content: [
        "You agree to use S.T.A.R.T. in a respectful and appropriate manner.",
        "You will not harass, abuse, or harm another person or entity.",
        "You will not post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.",
        "You will not impersonate any person or entity or falsely state or otherwise misrepresent yourself.",
        "You will not upload, post, or otherwise transmit any content that infringes any patent, trademark, trade secret, copyright, or other proprietary rights.",
        "You acknowledge that all content posted on S.T.A.R.T. is the sole responsibility of the person who originated such content.",
      ],
    },
    {
      title: "4. Anonymous Profile System",
      content: [
        "S.T.A.R.T. operates on an anonymous-first basis where users can connect without revealing their identity initially.",
        "You agree to respect the anonymity of other users until mutual consent is given to reveal identities.",
        "Attempting to bypass the anonymity system or identify users without consent is strictly prohibited.",
        "Both parties must mutually agree before any personal identifying information is revealed through the platform.",
      ],
    },
    {
      title: "5. Credit System",
      content: [
        "S.T.A.R.T. uses a credit-based system for certain features and interactions.",
        "Credits may be earned through daily logins, profile completion, and other activities.",
        "Credits are non-transferable and have no cash value.",
        "We reserve the right to modify credit earning rates and costs at any time.",
        "Attempting to manipulate or abuse the credit system may result in account suspension or termination.",
      ],
    },
    {
      title: "6. Content Ownership and Rights",
      content: [
        "You retain all rights to the content you post on S.T.A.R.T.",
        "By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content through the service.",
        "We reserve the right to remove any content that violates these terms or is deemed inappropriate.",
        "You represent and warrant that you own or have the necessary rights to all content you post.",
      ],
    },
    {
      title: "7. Privacy and Data Protection",
      content: [
        "Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your information.",
        "We implement industry-standard security measures to protect your data.",
        "You can request deletion of your account and associated data at any time.",
        "We will never sell your personal information to third parties.",
      ],
    },
    {
      title: "8. Termination",
      content: [
        "We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.",
        "Upon termination, your right to use the service will immediately cease.",
        "You may delete your account at any time through your account settings.",
        "All provisions of the Terms which by their nature should survive termination shall survive termination.",
      ],
    },
    {
      title: "9. Disclaimers and Limitation of Liability",
      content: [
        "The service is provided on an 'AS IS' and 'AS AVAILABLE' basis without any warranties of any kind.",
        "We do not guarantee that the service will be uninterrupted, timely, secure, or error-free.",
        "We are not responsible for the conduct of any user on or off the service.",
        "In no event shall S.T.A.R.T. be liable for any indirect, incidental, special, consequential or punitive damages.",
        "Our total liability shall not exceed the amount you have paid us in the past twelve months.",
      ],
    },
    {
      title: "10. Dispute Resolution",
      content: [
        "Any disputes arising out of or relating to these Terms shall be resolved through binding arbitration.",
        "You agree to waive your right to participate in a class action lawsuit or class-wide arbitration.",
        "The arbitration shall be conducted in accordance with the rules of the American Arbitration Association.",
      ],
    },
    {
      title: "11. Changes to Terms",
      content: [
        "We reserve the right to modify these terms at any time.",
        "We will provide notice of significant changes through the service or via email.",
        "Your continued use of the service after changes constitutes acceptance of the new terms.",
      ],
    },
    {
      title: "12. Contact Information",
      content: [
        "If you have any questions about these Terms, please contact us at:",
        "Email: legal@startdating.app",
        "Address: S.T.A.R.T. Dating Inc., 123 Innovation Drive, San Francisco, CA 94105",
      ],
    },
  ],
};

export const privacyData: LegalData = {
  lastUpdated: "January 11, 2025",
  sections: [
    {
      title: "1. Information We Collect",
      content: [
        "Personal Information: When you create an account, we collect your name, email address, date of birth, and other information you provide during registration.",
        "Profile Information: We collect information you add to your profile, including photos, interests, preferences, and biographical details.",
        "Usage Data: We automatically collect information about how you use our service, including your interactions, matches, messages, and feature usage.",
        "Device Information: We collect information about the devices you use to access S.T.A.R.T., including IP address, browser type, operating system, and mobile device identifiers.",
        "Location Information: With your permission, we may collect your precise or approximate location to help you connect with nearby users.",
      ],
    },
    {
      title: "2. How We Use Your Information",
      content: [
        "To provide, maintain, and improve our services",
        "To create and manage your account",
        "To facilitate matches and connections between users",
        "To communicate with you about your account and our services",
        "To personalize your experience and provide relevant content",
        "To develop new features and improve existing ones",
        "To detect, prevent, and address fraud, security issues, and technical problems",
        "To comply with legal obligations and enforce our Terms of Service",
        "To send you promotional materials and updates (with your consent)",
      ],
    },
    {
      title: "3. Information Sharing and Disclosure",
      content: [
        "With Other Users: Your profile information is shared with other users based on your privacy settings and matching preferences. Initially, your identity remains anonymous until you choose to reveal it.",
        "Service Providers: We may share information with third-party service providers who perform services on our behalf, such as hosting, data analysis, payment processing, and customer service.",
        "Legal Requirements: We may disclose your information if required by law, legal process, or government request.",
        "Business Transfers: In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.",
        "With Your Consent: We may share your information for any other purpose with your explicit consent.",
        "We will never sell your personal information to third parties for their marketing purposes.",
      ],
    },
    {
      title: "4. Anonymous Profile System",
      content: [
        "S.T.A.R.T. operates on an anonymous-first principle where your identity is protected until you choose to reveal it.",
        "Other users will see your interests, preferences, and compatibility information without seeing your name or photos initially.",
        "Identity reveals require mutual consent from both matched users.",
        "We implement technical measures to maintain anonymity and prevent unauthorized identity discovery.",
        "You control when and how to reveal your identity to your matches.",
      ],
    },
    {
      title: "5. Data Security",
      content: [
        "We implement industry-standard security measures to protect your information from unauthorized access, disclosure, alteration, and destruction.",
        "All data transmission is encrypted using SSL/TLS protocols.",
        "We use secure servers and regularly update our security practices.",
        "User passwords are hashed and cannot be retrieved by our staff.",
        "We conduct regular security audits and vulnerability assessments.",
        "However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      title: "6. Your Privacy Rights and Choices",
      content: [
        "Access and Update: You can access and update your personal information through your account settings.",
        "Delete Account: You can request deletion of your account at any time. We will delete your data within 30 days of your request.",
        "Data Portability: You can request a copy of your data in a machine-readable format.",
        "Marketing Opt-Out: You can unsubscribe from promotional emails using the unsubscribe link in any marketing email.",
        "Cookie Controls: You can control cookies through your browser settings.",
        "Location Services: You can disable location services through your device settings.",
        "Do Not Track: We currently do not respond to Do Not Track signals.",
      ],
    },
    {
      title: "7. Data Retention",
      content: [
        "We retain your information for as long as your account is active or as needed to provide you services.",
        "If you delete your account, we will delete your data within 30 days, except where required by law to retain certain information.",
        "We may retain and use your information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.",
        "Backup copies of deleted data may persist for up to 90 days in our backup systems.",
      ],
    },
    {
      title: "8. Cookies and Tracking Technologies",
      content: [
        "We use cookies, web beacons, and similar tracking technologies to collect information about your browsing activities.",
        "Cookies help us remember your preferences, understand how you use our service, and improve your experience.",
        "We use both session cookies (which expire when you close your browser) and persistent cookies (which remain on your device).",
        "Third-party services we use (like Google Analytics) may also place cookies on your device.",
        "You can control cookie settings through your browser, but disabling cookies may limit functionality.",
      ],
    },
    {
      title: "9. Third-Party Services",
      content: [
        "Our service may contain links to third-party websites and services not operated by us.",
        "We use Google OAuth for authentication, which is subject to Google's Privacy Policy.",
        "We are not responsible for the privacy practices of third-party services.",
        "We encourage you to review the privacy policies of any third-party services you interact with.",
      ],
    },
    {
      title: "10. Children's Privacy",
      content: [
        "S.T.A.R.T. is not intended for users under the age of 18.",
        "We do not knowingly collect information from children under 18.",
        "If we become aware that we have collected information from a child under 18, we will take steps to delete that information immediately.",
        "If you believe we have information from a child under 18, please contact us immediately.",
      ],
    },
    {
      title: "11. International Data Transfers",
      content: [
        "Your information may be transferred to and processed in countries other than your own.",
        "We take appropriate safeguards to ensure your data is protected in accordance with this Privacy Policy.",
        "By using S.T.A.R.T., you consent to the transfer of your information to countries that may have different data protection laws than your country.",
      ],
    },
    {
      title: "12. California Privacy Rights",
      content: [
        "California residents have specific rights under the California Consumer Privacy Act (CCPA).",
        "You have the right to know what personal information we collect, use, and disclose.",
        "You have the right to request deletion of your personal information.",
        "You have the right to opt-out of the sale of personal information (we do not sell personal information).",
        "You have the right to non-discrimination for exercising your privacy rights.",
        "To exercise these rights, please contact us at privacy@startdating.app.",
      ],
    },
    {
      title: "13. Changes to This Privacy Policy",
      content: [
        "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.",
        "We will notify you of significant changes by posting a notice on our service or sending you an email.",
        "The 'Last Updated' date at the top of this policy indicates when it was last revised.",
        "Your continued use of S.T.A.R.T. after changes constitutes acceptance of the updated Privacy Policy.",
      ],
    },
    {
      title: "14. Contact Us",
      content: [
        "If you have questions or concerns about this Privacy Policy or our data practices, please contact us:",
        "Email: privacy@startdating.app",
        "Data Protection Officer: dpo@startdating.app",
        "Address: S.T.A.R.T. Dating Inc., 123 Innovation Drive, San Francisco, CA 94105",
        "Phone: +1 (555) 123-4567",
      ],
    },
  ],
};

