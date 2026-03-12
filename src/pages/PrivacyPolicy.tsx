import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useSiteSetting } from "@/hooks/useSiteSettings";

const PrivacyPolicy = () => {
  const { data: setting } = useSiteSetting('legal_privacy_policy');
  const custom = setting?.value as Record<string, any> | null;

  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navigation />
        
        <main className="pt-32 pb-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto">
              <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground mb-10 text-sm">
                Last updated: {custom?.last_updated || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              
              {custom?.custom_content ? (
                <div className="prose prose-lg max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: custom.custom_content }} />
              ) : (
                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                  <p className="text-lg leading-relaxed">
                    <strong className="text-foreground">RoomRefine</strong> ("we," "us," or "our") operates roomrefine.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Information We Collect
                  </h2>
                  <h3 className="font-display text-xl font-medium text-foreground mt-6 mb-3">Personal Data</h3>
                  <p>We may collect personally identifiable information that you voluntarily provide, including:</p>
                  <ul className="space-y-2 list-disc pl-6">
                    <li><strong className="text-foreground">Email address</strong> — when you subscribe to our newsletter</li>
                    <li><strong className="text-foreground">Name and email</strong> — when you submit a contact form</li>
                    <li><strong className="text-foreground">Photos and social handles</strong> — when you submit customer photos</li>
                  </ul>

                  <h3 className="font-display text-xl font-medium text-foreground mt-6 mb-3">Automatically Collected Data</h3>
                  <p>When you visit our website, we automatically collect certain information, including:</p>
                  <ul className="space-y-2 list-disc pl-6">
                    <li>Browser type and version</li>
                    <li>Operating system</li>
                    <li>Pages visited and time spent</li>
                    <li>Referring website</li>
                    <li>IP address (anonymized)</li>
                  </ul>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    How We Use Your Information
                  </h2>
                  <ul className="space-y-2 list-disc pl-6">
                    <li>To send newsletters and promotional content (with your consent)</li>
                    <li>To respond to inquiries and contact form submissions</li>
                    <li>To improve our website content and user experience</li>
                    <li>To analyze website traffic and usage patterns</li>
                    <li>To display relevant product recommendations</li>
                  </ul>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Cookies & Tracking Technologies
                  </h2>
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience. Cookies are small data files stored on your device. We use:
                  </p>
                  <ul className="space-y-2 list-disc pl-6">
                    <li><strong className="text-foreground">Essential cookies</strong> — required for the website to function properly</li>
                    <li><strong className="text-foreground">Analytics cookies</strong> — Google Analytics to understand how visitors interact with our site</li>
                    <li><strong className="text-foreground">Affiliate cookies</strong> — Amazon Associates cookies to track referrals</li>
                  </ul>
                  <p>
                    You can control cookies through your browser settings. Disabling cookies may affect website functionality.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Google Analytics
                  </h2>
                  <p>
                    We use Google Analytics to collect and analyze website traffic data. Google Analytics uses cookies to collect anonymous information such as the number of visitors, pages visited, and time on site. This data helps us improve our content. Google's privacy policy can be found at{" "}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      policies.google.com/privacy
                    </a>.
                  </p>
                  <p>
                    You can opt out of Google Analytics by installing the{" "}
                    <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      Google Analytics Opt-out Browser Add-on
                    </a>.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Amazon Associates Program
                  </h2>
                  <p>
                    RoomRefine is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com. When you click an affiliate link and make a purchase, Amazon may place cookies on your device to track the referral. Please refer to{" "}
                    <a href="https://www.amazon.com/gp/help/customer/display.html?nodeId=468496" target="_blank" rel="nofollow noopener noreferrer" className="text-accent hover:underline">
                      Amazon's Privacy Notice
                    </a>{" "}
                    for details.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Third-Party Disclosure
                  </h2>
                  <p>
                    We do not sell, trade, or transfer your personally identifiable information to third parties. This does not include trusted partners who assist us in operating our website (such as email service providers), provided they agree to keep this information confidential.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Email Newsletter
                  </h2>
                  <p>
                    If you subscribe to our newsletter, we collect your email address to send you curated home decor content, product recommendations, and updates. You can unsubscribe at any time by clicking the "unsubscribe" link in any email or by contacting us directly.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    GDPR Compliance (EU/EEA Visitors)
                  </h2>
                  <p>If you are a resident of the European Union or European Economic Area, you have the following rights:</p>
                  <ul className="space-y-2 list-disc pl-6">
                    <li><strong className="text-foreground">Right of Access</strong> — You may request copies of your personal data.</li>
                    <li><strong className="text-foreground">Right to Rectification</strong> — You may request correction of inaccurate data.</li>
                    <li><strong className="text-foreground">Right to Erasure</strong> — You may request deletion of your personal data.</li>
                    <li><strong className="text-foreground">Right to Restrict Processing</strong> — You may request restriction of processing.</li>
                    <li><strong className="text-foreground">Right to Data Portability</strong> — You may request transfer of your data.</li>
                    <li><strong className="text-foreground">Right to Object</strong> — You may object to our processing of your data.</li>
                  </ul>
                  <p>
                    To exercise any of these rights, please{" "}
                    <a href="/contact" className="text-accent hover:underline">contact us</a>.
                    We will respond within 30 days.
                  </p>
                  <p>
                    <strong className="text-foreground">Legal basis for processing:</strong> We process personal data based on consent (newsletter subscriptions), legitimate interest (analytics, site improvement), and contractual necessity (responding to contact requests).
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    CCPA Compliance (California Residents)
                  </h2>
                  <p>
                    Under the California Consumer Privacy Act, California residents have the right to request disclosure of data collected, request deletion, and opt out of data sales. We do not sell personal information. To make a request, please{" "}
                    <a href="/contact" className="text-accent hover:underline">contact us</a>.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Data Security
                  </h2>
                  <p>
                    We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Children's Privacy
                  </h2>
                  <p>
                    Our website is not directed to children under 13. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Changes to This Policy
                  </h2>
                  <p>
                    We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.
                  </p>

                  <h2 className="font-display text-2xl font-medium text-foreground mt-10 mb-4">
                    Contact Us
                  </h2>
                  <p>
                    If you have questions about this Privacy Policy, please{" "}
                    <a href="/contact" className="text-accent hover:underline">contact us</a>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default PrivacyPolicy;