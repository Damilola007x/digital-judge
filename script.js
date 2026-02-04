document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileInput = document.getElementById('pdfFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay'); // Added for filename show
    const scenarioInput = document.getElementById('scenario');
    const loader = document.getElementById('loader');
    const resultArea = document.getElementById('resultArea');
    
    const verdictTitle = document.getElementById('verdictTitle');
    const analysisContent = document.getElementById('analysisContent');
    const ruleCount = document.getElementById('ruleCount');
    const verdictLabel = document.getElementById('verdictLabel');

    // --- 1. Show File Name after uploading ---
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) {
            fileNameDisplay.innerText = "Selected: " + fileInput.files[0].name;
            fileNameDisplay.style.color = "var(--accent)"; // Blue from your CSS
        } else {
            fileNameDisplay.innerText = "No file selected";
            fileNameDisplay.style.color = "var(--text-dim)";
        }
    });

    // --- 2. Run Analysis ---
    analyzeBtn.addEventListener('click', async () => {
        // Validate Input
        if (!fileInput.files[0] || !scenarioInput.value.trim()) {
            alert("Please upload a PDF and describe the scenario.");
            return;
        }

        // --- 3. UI Loading State ---
        loader.style.display = 'block';
        resultArea.style.display = 'none';
        
        // Disable button & change text
        analyzeBtn.disabled = true;
        analyzeBtn.innerText = "Analyzing logic gates...";
        analyzeBtn.style.opacity = "0.7";

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        formData.append("scenario", scenarioInput.value);

        try {
            // 4. Send to Backend 
           const response = await fetch('https://digital-judge-backend.onrender.com/api/compliance/audit', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.explanation || "Server Error");
            }

            const data = await response.json();

            // 5. Update UI with AI Result
            if (data.success) {
                verdictTitle.innerText = data.status; 
                analysisContent.innerText = data.explanation;
                ruleCount.innerText = "Rules identified: " + data.rulesCount;

                if (data.status.toUpperCase() === "VIOLATION") {
                    applyVerdictStyle("#ef4444", "#fef2f2"); // Updated to match your SaaS Red
                } else if (data.status.toUpperCase() === "COMPLIANT") {
                    applyVerdictStyle("#22c55e", "#f0fdf4"); // Updated to match your SaaS Green
                } else {
                    applyVerdictStyle("#64748b", "#f8fafc"); 
                }
                
                resultArea.style.display = 'block';
                resultArea.scrollIntoView({ behavior: 'smooth' });
                
                // Change button text after successful analysis
                analyzeBtn.innerText = "Audit Complete";
                analyzeBtn.classList.add('processed');
                
            } else {
                alert("Audit failed: " + data.explanation);
                analyzeBtn.innerText = "Run Logical Audit";
                analyzeBtn.disabled = false;
                analyzeBtn.style.opacity = "1";
            }
        } catch (error) {
            console.error("Audit Error:", error);
            alert("Error: " + error.message);
            analyzeBtn.innerText = "Run Logical Audit";
            analyzeBtn.disabled = false;
            analyzeBtn.style.opacity = "1";
        } finally {
            loader.style.display = 'none';
        }
    });

    function applyVerdictStyle(primaryColor, bgColor) {
        verdictLabel.style.backgroundColor = primaryColor;
        verdictTitle.style.color = primaryColor;
        resultArea.style.borderLeft = `8px solid ${primaryColor}`;
        resultArea.style.backgroundColor = bgColor;
    }
});