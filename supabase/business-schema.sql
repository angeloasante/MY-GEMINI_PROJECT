-- ============================================
-- GASLIGHTER DETECT - BUSINESS MODE SCHEMA
-- Supabase PostgreSQL
-- ============================================

-- ============================================
-- DROP EXISTING TABLES (clean slate)
-- ============================================
DROP TABLE IF EXISTS business_interactions CASCADE;
DROP TABLE IF EXISTS trip_stops CASCADE;
DROP TABLE IF EXISTS trip_plans CASCADE;
DROP TABLE IF EXISTS scam_reports CASCADE;
DROP TABLE IF EXISTS scam_patterns CASCADE;
DROP TABLE IF EXISTS contract_reviews CASCADE;
DROP TABLE IF EXISTS contract_red_flags CASCADE;
DROP TABLE IF EXISTS visa_documents CASCADE;
DROP TABLE IF EXISTS visa_applications CASCADE;

-- ============================================
-- VISA APPLICATIONS
-- Track visa document analysis and applications
-- ============================================
CREATE TABLE IF NOT EXISTS visa_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Application details
  nationality TEXT NOT NULL,
  destination TEXT NOT NULL,
  visa_type TEXT,
  purpose TEXT, -- tourism, business, work, study
  planned_travel_date DATE,
  duration_days INTEGER,
  
  -- Status tracking
  status TEXT DEFAULT 'preparing' CHECK (status IN ('preparing', 'documents_ready', 'submitted', 'approved', 'denied')),
  
  -- Analysis results
  documents_analyzed JSONB DEFAULT '[]'::jsonb,
  checklist_status JSONB DEFAULT '[]'::jsonb,
  approval_likelihood TEXT CHECK (approval_likelihood IN ('high', 'medium', 'low')),
  approval_percentage INTEGER CHECK (approval_percentage >= 0 AND approval_percentage <= 100),
  
  -- Requirements from DA API
  requirements_data JSONB,
  missing_documents TEXT[],
  critical_issues TEXT[],
  recommendations TEXT[],
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_visa_applications_user ON visa_applications(user_id);
CREATE INDEX idx_visa_applications_status ON visa_applications(status);
CREATE INDEX idx_visa_applications_destination ON visa_applications(destination);

-- ============================================
-- VISA DOCUMENTS
-- Individual documents analyzed for visa applications
-- ============================================
CREATE TABLE IF NOT EXISTS visa_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES visa_applications(id) ON DELETE CASCADE,
  
  -- Document info
  document_type TEXT NOT NULL CHECK (document_type IN ('passport', 'bank_statement', 'employment_letter', 'photo', 'tb_test', 'hotel_booking', 'flight_booking', 'invitation_letter', 'insurance', 'other')),
  file_name TEXT,
  mime_type TEXT,
  
  -- Extracted data
  extracted_data JSONB,
  
  -- Validation results
  issues JSONB DEFAULT '[]'::jsonb, -- [{issue, severity, fix}]
  is_valid BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visa_documents_application ON visa_documents(application_id);

-- ============================================
-- CONTRACT REVIEWS
-- Legal document analysis results
-- ============================================
CREATE TABLE IF NOT EXISTS contract_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contract details
  contract_type TEXT CHECK (contract_type IN ('employment', 'nda', 'service', 'freelance', 'lease', 'partnership', 'other')),
  contract_title TEXT,
  parties JSONB, -- ["Party A", "Party B"]
  effective_date DATE,
  term_length TEXT,
  
  -- Analysis results
  overall_risk TEXT CHECK (overall_risk IN ('low', 'medium', 'high', 'critical')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  
  -- Clauses
  clauses_analyzed JSONB DEFAULT '[]'::jsonb,
  danger_clauses TEXT[],
  caution_clauses TEXT[],
  safe_clauses TEXT[],
  
  -- Recommendations
  must_negotiate TEXT[],
  recommend_lawyer BOOLEAN DEFAULT false,
  lawyer_threshold TEXT,
  
  -- Full analysis
  formatted_response JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contract_reviews_user ON contract_reviews(user_id);
CREATE INDEX idx_contract_reviews_risk ON contract_reviews(overall_risk);

-- ============================================
-- CONTRACT RED FLAGS TAXONOMY
-- Reference table for contract red flag types
-- ============================================
CREATE TABLE IF NOT EXISTS contract_red_flags (
  id SERIAL PRIMARY KEY,
  flag_key TEXT UNIQUE NOT NULL,
  flag_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  typical_clause_names TEXT[],
  negotiation_tips TEXT[]
);

-- Insert standard red flags
INSERT INTO contract_red_flags (flag_key, flag_name, severity, description, typical_clause_names, negotiation_tips) VALUES
('non_compete', 'Non-Compete Clause', 'high', 'Restricts ability to work in industry for specified period', ARRAY['Non-Competition', 'Covenant Not to Compete'], ARRAY['Limit to 6 months', 'Add geographic restrictions', 'Define "competitor" narrowly']),
('ip_assignment_broad', 'Broad IP Assignment', 'critical', 'Company owns all intellectual property including personal projects', ARRAY['Intellectual Property', 'Work Product', 'Inventions'], ARRAY['Exclude personal projects', 'Limit to work-related IP', 'Add carve-out for prior work']),
('ip_assignment_work', 'Work IP Assignment', 'medium', 'Company owns work-related IP (standard)', ARRAY['Work Product'], ARRAY['This is typically acceptable']),
('mandatory_arbitration', 'Mandatory Arbitration', 'high', 'Cannot sue in court, must use private arbitration', ARRAY['Dispute Resolution', 'Arbitration'], ARRAY['Request option for small claims court', 'Specify neutral arbitration location']),
('class_action_waiver', 'Class Action Waiver', 'high', 'Cannot join class action lawsuits', ARRAY['Class Action Waiver', 'Dispute Resolution'], ARRAY['Try to remove entirely', 'Understand what rights you''re waiving']),
('unilateral_termination', 'Unilateral Termination', 'medium', 'Company can terminate without cause', ARRAY['Termination', 'At-Will Employment'], ARRAY['Request notice period', 'Add severance clause', 'Define termination for cause']),
('asymmetric_liability', 'Asymmetric Liability', 'high', 'Company''s liability is capped but yours is unlimited', ARRAY['Limitation of Liability', 'Indemnification'], ARRAY['Make liability mutual', 'Cap your liability too']),
('auto_renewal', 'Auto-Renewal', 'low', 'Contract automatically renews', ARRAY['Term', 'Renewal'], ARRAY['Set calendar reminder', 'Request opt-in renewal']),
('long_notice_period', 'Long Notice Period', 'medium', 'Requires 90+ days notice to terminate', ARRAY['Notice Period', 'Termination'], ARRAY['Reduce to 30 days', 'Make mutual']),
('non_solicitation', 'Non-Solicitation', 'medium', 'Cannot work with former clients/colleagues', ARRAY['Non-Solicitation'], ARRAY['Limit duration', 'Define scope narrowly']),
('broad_confidentiality', 'Broad Confidentiality', 'medium', 'Too much information classified as confidential', ARRAY['Confidentiality', 'NDA'], ARRAY['Add expiration date', 'Exclude public information']),
('indemnification', 'Indemnification Clause', 'high', 'You must pay company''s legal fees and damages', ARRAY['Indemnification', 'Hold Harmless'], ARRAY['Make mutual', 'Cap amount', 'Limit to your actions only']),
('unfavorable_jurisdiction', 'Unfavorable Jurisdiction', 'medium', 'Disputes must be resolved in distant location', ARRAY['Governing Law', 'Jurisdiction', 'Venue'], ARRAY['Request local jurisdiction', 'Allow remote participation']),
('penalty_clauses', 'Penalty Clauses', 'high', 'Financial penalties for breach', ARRAY['Penalties', 'Liquidated Damages'], ARRAY['Cap amount', 'Make proportional to actual damages']),
('assignment_without_consent', 'Assignment Without Consent', 'medium', 'Company can transfer contract without your approval', ARRAY['Assignment', 'Transfer'], ARRAY['Require consent for assignment', 'Add termination right if assigned'])
ON CONFLICT (flag_key) DO NOTHING;

-- ============================================
-- B2B SCAM REPORTS
-- Business fraud detection results
-- ============================================
CREATE TABLE IF NOT EXISTS scam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content analyzed
  content_type TEXT NOT NULL CHECK (content_type IN ('email', 'invoice', 'message', 'document')),
  content_text TEXT,
  sender_email TEXT,
  sender_domain TEXT,
  claimed_company TEXT,
  invoice_amount DECIMAL,
  
  -- Analysis results
  scam_likelihood TEXT NOT NULL CHECK (scam_likelihood IN ('safe', 'suspicious', 'likely_scam')),
  confidence_score DECIMAL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Red flags detected
  red_flags JSONB DEFAULT '[]'::jsonb, -- [{flag, evidence, severity}]
  urgency_tactics TEXT[],
  suspicious_payment_methods TEXT[],
  
  -- Verification results
  verification_data JSONB,
  
  -- Recommendations
  recommended_actions TEXT[],
  
  -- Formatted response
  formatted_response JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scam_reports_user ON scam_reports(user_id);
CREATE INDEX idx_scam_reports_likelihood ON scam_reports(scam_likelihood);

-- ============================================
-- B2B SCAM PATTERNS TAXONOMY
-- Reference table for B2B scam types
-- ============================================
CREATE TABLE IF NOT EXISTS scam_patterns (
  id SERIAL PRIMARY KEY,
  pattern_key TEXT UNIQUE NOT NULL,
  pattern_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('medium', 'high', 'critical')),
  description TEXT NOT NULL,
  indicators TEXT[],
  typical_phrases TEXT[]
);

-- Insert standard scam patterns
INSERT INTO scam_patterns (pattern_key, pattern_name, severity, description, indicators, typical_phrases) VALUES
('ceo_fraud', 'CEO Fraud', 'critical', 'Fake email impersonating CEO requesting urgent wire transfer', ARRAY['Urgent tone', 'Wire transfer request', 'Secrecy required', 'Slightly different email domain'], ARRAY['I need you to handle a confidential matter', 'Don''t discuss this with anyone', 'Wire transfer needed immediately']),
('invoice_manipulation', 'Invoice Manipulation', 'critical', 'Real invoice with bank details changed to fraudster account', ARRAY['Bank details different from usual', 'Recent vendor email compromise', 'Urgent payment request'], ARRAY['We''ve updated our banking details', 'Please update our payment information']),
('vendor_impersonation', 'Vendor Impersonation', 'critical', 'Pretending to be a known vendor to redirect payments', ARRAY['Similar domain name', 'Request to change payment details', 'Urgency'], ARRAY['This is regarding your recent order', 'Please confirm payment to our new account']),
('payment_redirect', 'Payment Redirect Scam', 'critical', 'Request to change payment destination for existing invoices', ARRAY['Request for bank detail change', 'No phone verification', 'Email-only communication'], ARRAY['We''ve changed our bank account', 'Please remit future payments to this account']),
('advance_fee_b2b', 'Advance Fee Fraud', 'high', 'Requiring upfront payment to secure contract or deal', ARRAY['Upfront payment required', 'Too-good-to-be-true offer', 'Pressure to pay quickly'], ARRAY['Pay the processing fee', 'Small fee to release large contract']),
('fake_rfp', 'Fake RFP/RFQ', 'high', 'Fake request for proposal to harvest company information', ARRAY['Vague company details', 'Requests sensitive pricing/capability info', 'No follow-up meeting offered'], ARRAY['We''re evaluating vendors', 'Please provide your complete pricing structure']),
('domain_spoofing', 'Domain Spoofing', 'high', 'Email from lookalike domain (micros0ft.com vs microsoft.com)', ARRAY['Visually similar domain', 'Character substitution', 'Recent domain registration'], ARRAY['Verify your account', 'Action required on your account']),
('urgency_pressure', 'Urgency Pressure Tactics', 'high', 'Creating artificial urgency to prevent verification', ARRAY['Tight deadline', 'Threats of consequences', 'No time to verify'], ARRAY['Payment needed within 24 hours', 'Avoid late fees', 'Legal action will be taken']),
('overpayment_scam', 'Overpayment Scam', 'medium', 'Paying too much and requesting refund of difference', ARRAY['Payment exceeds invoice', 'Request to refund difference', 'Unusual payment method'], ARRAY['I accidentally overpaid', 'Please wire the difference back']),
('directory_scam', 'Business Directory Scam', 'medium', 'Fake business directory listing fees', ARRAY['Unsolicited directory offer', 'Small recurring fees', 'Difficult to cancel'], ARRAY['Confirm your listing', 'Renew your business listing']),
('fake_compliance', 'Fake Compliance Notice', 'high', 'Pretending to be regulatory body demanding payment', ARRAY['Government impersonation', 'Threatening legal action', 'Unusual payment methods'], ARRAY['Pay the fine immediately', 'Your business license will be revoked']),
('supply_chain_attack', 'Supply Chain Attack', 'critical', 'Compromised vendor email used to defraud', ARRAY['Known vendor domain', 'Unusual request', 'Banking detail change'], ARRAY['Please update our payment information in your system'])
ON CONFLICT (pattern_key) DO NOTHING;

-- ============================================
-- TRIP PLANS
-- Multi-city travel planning results
-- ============================================
CREATE TABLE IF NOT EXISTS trip_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Trip details
  nationality TEXT NOT NULL,
  trip_name TEXT,
  
  -- Stops
  stops JSONB NOT NULL, -- [{country, purpose, days}]
  total_countries INTEGER,
  total_days INTEGER,
  
  -- Visa analysis
  visas_required INTEGER,
  per_stop_analysis JSONB DEFAULT '[]'::jsonb,
  layover_alerts JSONB DEFAULT '[]'::jsonb,
  
  -- Combined checklist
  combined_checklist JSONB DEFAULT '[]'::jsonb,
  suggested_order TEXT[],
  ordering_reason TEXT,
  
  -- Costs
  total_visa_cost DECIMAL,
  total_insurance_cost DECIMAL,
  total_estimated_cost DECIMAL,
  
  -- DA integration
  diaspora_multi_city_link TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trip_plans_user ON trip_plans(user_id);

-- ============================================
-- TRIP STOPS
-- Individual stops in a trip plan
-- ============================================
CREATE TABLE IF NOT EXISTS trip_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trip_plans(id) ON DELETE CASCADE,
  
  -- Stop details
  stop_order INTEGER NOT NULL,
  country_code TEXT NOT NULL,
  country_name TEXT NOT NULL,
  purpose TEXT CHECK (purpose IN ('tourism', 'business', 'layover', 'work', 'study', 'medical', 'other')),
  duration_days INTEGER,
  
  -- Visa requirements
  visa_required BOOLEAN,
  visa_type TEXT,
  processing_days INTEGER,
  estimated_cost DECIMAL,
  documents_required TEXT[],
  
  -- Travel advisory
  travel_advisory TEXT CHECK (travel_advisory IN ('none', 'low', 'medium', 'high', 'critical')),
  advisory_notes TEXT,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trip_stops_trip ON trip_stops(trip_id);

-- ============================================
-- BUSINESS INTERACTIONS
-- General log of all business mode interactions
-- ============================================
CREATE TABLE IF NOT EXISTS business_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Interaction details
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('visa', 'legal', 'scam', 'trip')),
  user_query TEXT,
  
  -- Input/Output
  analysis_input JSONB,
  analysis_result JSONB,
  synthesized_response TEXT,
  action_items JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_business_interactions_user ON business_interactions(user_id);
CREATE INDEX idx_business_interactions_type ON business_interactions(analysis_type);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE scam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_interactions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE POLICIES
-- ============================================
-- Users can only access their own data
CREATE POLICY "Users can view own visa applications" ON visa_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own visa applications" ON visa_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own visa applications" ON visa_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own visa applications" ON visa_applications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own visa documents" ON visa_documents FOR SELECT USING (application_id IN (SELECT id FROM visa_applications WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own visa documents" ON visa_documents FOR INSERT WITH CHECK (application_id IN (SELECT id FROM visa_applications WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own visa documents" ON visa_documents FOR DELETE USING (application_id IN (SELECT id FROM visa_applications WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own contract reviews" ON contract_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contract reviews" ON contract_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own contract reviews" ON contract_reviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own scam reports" ON scam_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scam reports" ON scam_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own scam reports" ON scam_reports FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own trip plans" ON trip_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trip plans" ON trip_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trip plans" ON trip_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trip plans" ON trip_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own trip stops" ON trip_stops FOR SELECT USING (trip_id IN (SELECT id FROM trip_plans WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own trip stops" ON trip_stops FOR INSERT WITH CHECK (trip_id IN (SELECT id FROM trip_plans WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own trip stops" ON trip_stops FOR DELETE USING (trip_id IN (SELECT id FROM trip_plans WHERE user_id = auth.uid()));

CREATE POLICY "Users can view own business interactions" ON business_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own business interactions" ON business_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own business interactions" ON business_interactions FOR DELETE USING (auth.uid() = user_id);