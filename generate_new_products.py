from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import os

def create_cover_page(c, title, subtitle, description, features, page_width, page_height):
    c.setFillColor(colors.HexColor('#1a1a2e'))
    c.rect(0, 0, page_width, page_height, fill=True)
    c.setStrokeColor(colors.HexColor('#e94560'))
    c.setLineWidth(3)
    c.line(50, page_height - 100, page_width - 50, page_height - 100)
    c.line(50, 100, page_width - 50, 100)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(page_width/2, page_height - 180, title)
    c.setFont("Helvetica", 16)
    c.setFillColor(colors.HexColor('#e94560'))
    c.drawCentredString(page_width/2, page_height - 220, subtitle)
    c.setFillColor(colors.HexColor('#cccccc'))
    c.setFont("Helvetica", 11)
    text_obj = c.beginText(80, page_height - 300)
    words = description.split()
    line = ""
    max_width = page_width - 160
    for word in words:
        test_line = line + " " + word if line else word
        if c.stringWidth(test_line, "Helvetica", 11) < max_width:
            line = test_line
        else:
            text_obj.textLine(line)
            line = word
    if line:
        text_obj.textLine(line)
    c.drawText(text_obj)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(80, page_height - 400, "What You Get:")
    c.setFont("Helvetica", 11)
    y = page_height - 430
    for feature in features[:6]:
        c.setFillColor(colors.HexColor('#e94560'))
        c.circle(90, y + 4, 4, fill=True)
        c.setFillColor(colors.white)
        short = feature[:55] + "..." if len(feature) > 55 else feature
        c.drawString(110, y, short)
        y -= 28
    c.setFillColor(colors.HexColor('#666666'))
    c.setFont("Helvetica", 10)
    c.drawCentredString(page_width/2, 50, "OpenShop | Instant Digital Download")

def create_content_page(c, page_num, title, content_sections, page_width, page_height):
    c.setFillColor(colors.white)
    c.rect(0, 0, page_width, page_height, fill=True)
    c.setFillColor(colors.HexColor('#1a1a2e'))
    c.rect(0, page_height - 60, page_width, 60, fill=True)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(50, page_height - 38, title)
    c.drawRightString(page_width - 50, page_height - 38, f"Page {page_num}")
    y = page_height - 100
    for section in content_sections:
        c.setFont("Helvetica-Bold", 15)
        c.setFillColor(colors.HexColor('#1a1a2e'))
        c.drawString(50, y, section['heading'])
        y -= 28
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.HexColor('#555555'))
        for line in section['content']:
            if c.stringWidth(line, "Helvetica", 10) > page_width - 100:
                line = line[:75] + "..."
            c.drawString(50, y, line)
            y -= 18
        y -= 15
    c.setFillColor(colors.HexColor('#999999'))
    c.setFont("Helvetica", 9)
    c.drawCentredString(page_width/2, 30, "OpenShop | Professional Digital Product")

products = [
    {
        'name': 'Notion Website Template Pack',
        'tagline': 'Build Stunning Websites Without Code',
        'description': 'Transform your Notion workspace into a beautiful, functional website. This comprehensive template pack includes 10 professionally designed website templates, step-by-step setup guides, and custom CSS snippets for advanced customization.',
        'features': ['10 Premium Notion Website Templates', 'Step-by-Step Setup Video Tutorials', 'Custom CSS Snippets Included', 'Mobile-Responsive Designs', 'SEO Optimization Checklist', 'Free Lifetime Updates'],
        'filename': 'notion-website-template-pack.pdf',
        'content': [
            {'heading': 'Getting Started with Notion Websites', 'content': ['Notion has evolved into more than just a productivity tool.', 'With the right templates, you can publish stunning websites', 'directly from your Notion workspace - no coding required.', 'This guide walks you through setting up your first', 'Notion-powered website in under 30 minutes.']},
            {'heading': 'Template Collection', 'content': ['Portfolio Template: Showcase your work beautifully', 'Business Landing Page: Convert visitors into customers', 'Blog Template: Full SEO optimization built-in', 'Product Launch Page: Perfect for new releases', 'Team Page: Beautiful org charts and profiles']},
            {'heading': 'Customization Guide', 'content': ['Each template is fully customizable. Change colors, fonts,', 'and layouts to match your brand identity.', 'Our CSS snippets allow advanced users to add', 'animations, gradients, and interactive elements.']}
        ]
    },
    {
        'name': 'Motion Animation Pack',
        'tagline': 'Premium Animated SVG & Lottie Animations',
        'description': 'Elevate your designs with this comprehensive collection of 200+ premium motion animations. Includes animated backgrounds, icon animations, loading spinners, and micro-interactions for web and video.',
        'features': ['200+ Premium Motion Animations', 'SVG, Lottie & GIF Formats', 'Compatible with All Major Design Tools', 'Commercial License Included', 'New Animations Added Monthly', 'Detailed Usage Documentation'],
        'filename': 'motion-animation-pack.pdf',
        'content': [
            {'heading': 'Animation Collection Overview', 'content': ['This pack includes five categories of animations:', 'Background Animations: Subtle, eye-catching backgrounds', 'Icon Animations: Bring your UI to life', 'Loading States: Creative progress indicators', 'Micro-interactions: Delightful hover and click effects']},
            {'heading': 'Technical Specifications', 'content': ['All animations are optimized for performance.', 'SVG animations are lightweight and scalable.', 'Lottie files work seamlessly in web and mobile apps.', 'GIF format ensures maximum compatibility.']},
            {'heading': 'Integration Guide', 'content': ['Webflow: Drag and drop Lottie files directly', 'Figma: Use our plugin for one-click animations', 'After Effects: Full source files included', 'Web Development: Copy-paste SVG code snippets']}
        ]
    },
    {
        'name': 'Personal Brand Blueprint',
        'tagline': 'Build an Unforgettable Personal Brand',
        'description': 'Your personal brand is your most valuable asset. This comprehensive blueprint guides you through discovering your unique value proposition, crafting your brand story, and building an authentic presence.',
        'features': ['Complete Brand Identity Framework', 'Storytelling Framework Included', 'Visual Brand Kit Templates', 'Social Media Optimization Guide', 'Networking & Visibility Strategy', 'Case Studies from Successful Brands'],
        'filename': 'personal-brand-blueprint.pdf',
        'content': [
            {'heading': 'Understanding Personal Branding', 'content': ['Personal branding is not about pretending to be someone', 'else - it is about authentically presenting who you are.', 'A strong personal brand opens doors to opportunities,', 'builds trust with your audience, and establishes you', 'as an authority in your field.']},
            {'heading': 'The Brand Discovery Process', 'content': ['Step 1: Define your core values and beliefs', 'Step 2: Identify your unique skills and experiences', 'Step 3: Understand your target audience deeply', 'Step 4: Craft your unique value proposition', 'Step 5: Develop your brand voice and personality']},
            {'heading': 'Building Your Brand Assets', 'content': ['Your visual identity includes colors, fonts, and imagery.', 'Your verbal identity includes tone, vocabulary, and stories.', 'Consistency across all touchpoints is key.', 'Use our templates to create cohesive brand materials.']}
        ]
    },
    {
        'name': 'Short-Form Video Masterclass',
        'tagline': 'Master TikTok, Reels & YouTube Shorts',
        'description': 'Learn to create viral short-form videos that captivate audiences and grow your following. This masterclass covers content strategy, filming techniques, editing secrets, and algorithm optimization.',
        'features': ['Complete Short-Form Video Strategy', '50+ Ready-to-Use Video Templates', 'Filming on Any Budget Guide', 'Editing Apps & Techniques Masterclass', 'Algorithm Optimization Secrets', 'Monetization Strategies for Creators'],
        'filename': 'short-form-video-masterclass.pdf',
        'content': [
            {'heading': 'The Short-Form Revolution', 'content': ['Short-form video has become the dominant content format.', 'TikTok, Instagram Reels, and YouTube Shorts collectively', 'command billions of daily views. Learning to create', 'compelling short videos is now essential.']},
            {'heading': 'Content Strategy Framework', 'content': ['Hook in the first 3 seconds or lose the viewer.', 'Use the PATTERN framework for viral-worthy content.', 'Batch create content to maintain consistency.', 'Repurpose long-form content into multiple shorts.']},
            {'heading': 'Technical Production Tips', 'content': ['Lighting: Natural light works best for beginners.', 'Audio: Good audio is more important than video quality.', 'Editing: Use jump cuts, text overlays, and trending sounds.', 'Captions: 80% of users watch without sound.']}
        ]
    },
    {
        'name': 'Digital Declutter System',
        'tagline': 'Reclaim Hours with an Organized Digital Life',
        'description': 'Digital clutter costs you time and mental energy every day. This comprehensive system helps you organize your digital workspace, automate file management, and create systems that keep you organized forever.',
        'features': ['Complete Digital Organization Framework', 'Email Inbox Zero Method', 'File Management System Template', 'Browser Tab Management Strategy', 'App & Notification Audit Guide', 'Automation Scripts for Common Tasks'],
        'filename': 'digital-declutter-system.pdf',
        'content': [
            {'heading': 'The Digital Declutter Philosophy', 'content': ['Digital clutter is invisible but its effects are not.', 'A cluttered digital workspace drains mental energy,', 'wastes time searching for files, and creates stress.', 'This system helps you create order and maintain it.']},
            {'heading': 'Email Inbox Zero System', 'content': ['The 4D Method: Delete, Delegate, Defer, Do.', 'Set specific times for email checking.', 'Use filters and labels to automate sorting.', 'Unsubscribe from everything non-essential.']},
            {'heading': 'File Organization Mastery', 'content': ['Create a consistent naming convention.', 'Use a simple folder hierarchy (max 3 levels deep).', 'Implement a weekly review ritual.', 'Automate backups with cloud sync.']}
        ]
    }
]

def create_product_pdf(product, output_path):
    page_width, page_height = A4
    c = canvas.Canvas(output_path, pagesize=A4)
    create_cover_page(c, product['name'], product['tagline'], product['description'], product['features'], page_width, page_height)
    c.showPage()
    page_num = 2
    for i in range(0, len(product['content']), 2):
        sections = product['content'][i:i+2]
        create_content_page(c, page_num, product['name'], sections, page_width, page_height)
        c.showPage()
        page_num += 1
    c.setFillColor(colors.HexColor('#1a1a2e'))
    c.rect(0, 0, page_width, page_height, fill=True)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(page_width/2, page_height/2 + 30, "Thank You!")
    c.setFont("Helvetica", 14)
    c.drawCentredString(page_width/2, page_height/2 - 20, "for choosing OpenShop")
    c.setFont("Helvetica", 11)
    c.setFillColor(colors.HexColor('#cccccc'))
    c.drawCentredString(page_width/2, page_height/2 - 60, "Instant download at scsc.qzz.io")
    c.showPage()
    c.save()
    print(f"Created: {output_path}")

output_dir = r"C:\Users\wl\AppData\Local\Temp\pdf_output\downloads"
os.makedirs(output_dir, exist_ok=True)
for product in products:
    output_path = os.path.join(output_dir, product['filename'])
    create_product_pdf(product, output_path)
print(f"\nAll 5 PDFs created successfully!")
