document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileInput = document.getElementById('pdfFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay'); 
    const scenarioInput = document.getElementById('scenario');
    const loader = document.getElementById('loader');
    const resultArea = document.getElementById('resultArea');
    
    const verdictTitle = document.getElementById('verdictTitle');
    const analysisContent = document.getElementById('analysisContent');
    
    // FIX: This MUST match the id="ruleCountDisplay" in your HTML
    const ruleCount = document.getElementById('ruleCountDisplay'); 
    
    const verdictLabel = document.getElementById('verdictLabel');

    // --- 1. Show File Name after uploading ---
    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) {
            fileNameDisplay.innerText = "Selected: " + fileInput.files[0].name;
            fileNameDisplay.style.color = "#2563eb"; 
        } else {
            fileNameDisplay.innerText = "No file selected";
            fileNameDisplay.style.color = "#64748b";
        }
    });

    // --- 2. Run Analysis ---
    analyzeBtn.addEventListener('click', async () => {
        if (!fileInput.files[0] || !scenarioInput.value.trim()) {
            alert("Please upload a PDF and describe the scenario.");
            return;
        }

        // --- 3. UI Loading State ---
        loader.style.display = 'block';
        resultArea.style.display = 'none';
        
        analyzeBtn.disabled = true;
        analyzeBtn.innerText = "Analyzing logic gates...";
        analyzeBtn.style.opacity = "0.7";

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        formData.append("scenario", scenarioInput.value);

        try {
            // 4. Send to Backend 
           const response = await fetch('http://localhost:8080/api/compliance/audit', {
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
                
                // This will now work because ruleCount matches ruleCountDisplay
                if (ruleCount) {
                    ruleCount.innerText = "Rules identified: " + data.rulesCount;
                }

                if (data.status.toUpperCase() === "VIOLATION") {
                    applyVerdictStyle("#ef4444", "#fef2f2"); 
                } else if (data.status.toUpperCase() === "COMPLIANT") {
                    applyVerdictStyle("#22c55e", "#f0fdf4"); 
                } else {
                    applyVerdictStyle("#64748b", "#f8fafc"); 
                }
                
                resultArea.style.display = 'block';
                resultArea.scrollIntoView({ behavior: 'smooth' });
                
                analyzeBtn.innerText = "Audit Complete";
                
            } else {
                alert("Audit failed: " + data.explanation);
                analyzeBtn.innerText = "Run Logical Audit";
                analyzeBtn.disabled = false;
            }
        } catch (error) {
            console.error("Audit Error:", error);
            alert("Error: " + error.message);
            analyzeBtn.innerText = "Run Logical Audit";
            analyzeBtn.disabled = false;
        } finally {
            loader.style.display = 'none';
        }
    });

    function applyVerdictStyle(primaryColor, bgColor) {
        if (verdictLabel) verdictLabel.style.backgroundColor = primaryColor;
        if (verdictTitle) verdictTitle.style.color = primaryColor;
        if (resultArea) {
            resultArea.style.borderLeft = `8px solid ${primaryColor}`;
            resultArea.style.backgroundColor = bgColor;
        }
    }
});