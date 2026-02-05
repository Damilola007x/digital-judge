document.addEventListener('DOMContentLoaded', () => {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const fileInput = document.getElementById('pdfFile');
    const fileNameDisplay = document.getElementById('fileNameDisplay'); 
    const scenarioInput = document.getElementById('scenario');
    const loader = document.getElementById('loader');
    const resultArea = document.getElementById('resultArea');
    
    const verdictTitle = document.getElementById('verdictTitle');
    const analysisContent = document.getElementById('analysisContent');
    
    // Matches the id="ruleCountDisplay" in your HTML footer
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
        analyzeBtn.innerText = "Consulting Logic Gates...";
        analyzeBtn.style.opacity = "0.7";

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        formData.append("scenario", scenarioInput.value);

        try {
            // --- 4. Send to Backend (Render URL) ---
            const response = await fetch('https://digital-judge-backend.onrender.com/api/compliance/audit', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            // --- 5. Update UI with AI Result ---
            if (data.success) {
                verdictTitle.innerText = data.status; 
                analysisContent.innerText = data.explanation;
                
                // Update the "Rules identified" count in the footer
                if (ruleCount) {
                    ruleCount.innerText = "Rules identified: " + (data.rulesCount || 0);
                }

                // Apply Dynamic Styling based on Verdict
                if (data.status.toUpperCase() === "VIOLATION") {
                    applyVerdictStyle("#ef4444", "#fef2f2"); // Red
                } else if (data.status.toUpperCase() === "COMPLIANT") {
                    applyVerdictStyle("#22c55e", "#f0fdf4"); // Green
                } else {
                    applyVerdictStyle("#64748b", "#f8fafc"); // Gray
                }
                
                resultArea.style.display = 'block';
                resultArea.scrollIntoView({ behavior: 'smooth' });
                
                analyzeBtn.innerText = "Audit Complete";
                analyzeBtn.disabled = false;
                analyzeBtn.style.opacity = "1";
                
            } else {
                alert("Audit failed: " + data.explanation);
                resetButton(analyzeBtn);
            }
        } catch (error) {
            console.error("Audit Error:", error);
            alert("Connection Error: Make sure the backend is awake on Render.");
            resetButton(analyzeBtn);
        } finally {
            loader.style.display = 'none';
        }
    });

    // Helper to reset button state
    function resetButton(btn) {
        btn.innerText = "Run Logical Audit";
        btn.disabled = false;
        btn.style.opacity = "1";
    }

    // Dynamic UI Color Logic
    function applyVerdictStyle(primaryColor, bgColor) {
        if (verdictLabel) verdictLabel.style.backgroundColor = primaryColor;
        if (verdictTitle) verdictTitle.style.color = primaryColor;
        if (resultArea) {
            resultArea.style.borderLeft = `8px solid ${primaryColor}`;
            resultArea.style.backgroundColor = bgColor;
        }
    }
});