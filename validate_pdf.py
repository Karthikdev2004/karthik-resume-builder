#!/usr/bin/env python3
"""
PDF Integration Validator
Checks if PDF generation files are properly set up
"""

import os
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Check if a file exists and print status"""
    if os.path.exists(filepath):
        print(f"✅ {description}: {filepath}")
        return True
    else:
        print(f"❌ MISSING {description}: {filepath}")
        return False

def check_file_content(filepath, search_strings, description):
    """Check if file contains required strings"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        missing = []
        for search_str in search_strings:
            if search_str not in content:
                missing.append(search_str)
        
        if not missing:
            print(f"✅ {description} has all required content")
            return True
        else:
            print(f"❌ {description} missing:")
            for m in missing:
                print(f"   - {m}")
            return False
    except Exception as e:
        print(f"❌ Error checking {description}: {e}")
        return False

def main():
    print("=" * 60)
    print("PDF INTEGRATION VALIDATION")
    print("=" * 60)
    print()
    
    base_dir = Path("/Users/apple/Downloads/Resume-Builder")
    all_good = True
    
    # Check 1: PDF library files exist
    print("1️⃣ Checking PDF Generation Files...")
    print("-" * 60)
    
    pdf_files = {
        base_dir / "src/lib/pdf-browser.ts": "jsPDF PDF Generator",
        base_dir / "src/lib/pdf/generator.ts": "PDFKit Generator (fallback)",
        base_dir / "src/lib/pdf/constants.ts": "PDF Constants",
    }
    
    for filepath, desc in pdf_files.items():
        if not check_file_exists(filepath, desc):
            all_good = False
    
    print()
    
    # Check 2: jsPDF is installed
    print("2️⃣ Checking Dependencies...")
    print("-" * 60)
    
    package_json = base_dir / "package.json"
    if check_file_exists(package_json, "package.json"):
        if check_file_content(
            package_json,
            ['"jspdf"'],
            "package.json (jsPDF dependency)"
        ):
            print("✅ jsPDF is listed in dependencies")
        else:
            print("❌ jsPDF NOT in package.json - run: npm install jspdf")
            all_good = False
    
    print()
    
    # Check 3: Step4Preview has integration
    print("3️⃣ Checking Integration in Step4Preview...")
    print("-" * 60)
    
    step4_file = base_dir / "src/app/components/builder/Step4Preview.tsx"
    
    if check_file_exists(step4_file, "Step4Preview.tsx"):
        required_code = [
            'import { downloadResumePDF }',  # Import statement
            'pdf-browser',  # Import from pdf-browser
            'handlePDFDownload',  # Handler function name
            'isPdfDownloading',  # State variable
        ]
        
        if not check_file_content(step4_file, required_code, "Step4Preview.tsx integration"):
            print()
            print("⚠️  PDF DOWNLOAD NOT INTEGRATED YET!")
            print()
            print("📝 You need to add the integration code to Step4Preview.tsx")
            print("    See: PDF_WORKING_SOLUTION.md for exact code")
            all_good = False
    
    print()
    
    # Check 4: Node modules
    print("4️⃣ Checking node_modules...")
    print("-" * 60)
    
    jspdf_module = base_dir / "node_modules/jspdf"
    if check_file_exists(jspdf_module, "jsPDF module"):
        print("✅ jsPDF module installed correctly")
    else:
        print("❌ jsPDF module NOT installed")
        print("   Run: npm install jspdf")
        all_good = False
    
    print()
    print("=" * 60)
    
    if all_good:
        print("✅ ALL CHECKS PASSED!")
        print()
        print("If PDF still doesn't download:")
        print("1. Make sure you added the code from PDF_WORKING_SOLUTION.md")
        print("2. Check browser console (F12) for errors")
        print("3. Try: npm run dev (restart dev server)")
    else:
        print("❌ ISSUES FOUND - Fix the items marked with ❌ above")
        print()
        print("Quick fixes:")
        print("1. Run: npm install jspdf")
        print("2. Add integration code to Step4Preview.tsx")
        print("3. Restart: npm run dev")
    
    print("=" * 60)
    
    return 0 if all_good else 1

if __name__ == "__main__":
    sys.exit(main())
