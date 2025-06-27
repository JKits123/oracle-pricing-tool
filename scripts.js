// Oracle Smart Pricing Tool - Shared JavaScript Functions

// Global variables
let totals = {
    equipment: 0,
    materials: 0,
    labour: 0,
    hire: 0,
    equipmentCost: 0,
    materialsCost: 0,
    labourCost: 0,
    hireCost: 0
};

let margins = {
    equipment: 45,
    materials: 55,
    labour: 0, // Labour already includes profit
    hire: 0,   // Hire is cost price
    overall: 0
};

// Color coding functions
function formatCost(amount) {
    return `<span class="cost-red">£${amount.toFixed(2)}</span>`;
}

function formatProfit(amount, percentage = null) {
    const percent = percentage ? ` (${percentage}%)` : '';
    return `<span class="profit-blue">£${amount.toFixed(2)}${percent}</span>`;
}

function formatPrice(amount) {
    return `<span class="price-green">£${amount.toFixed(2)}</span>`;
}

function formatGPPercentage(profit, sale) {
    if (sale === 0) return '0%';
    const gp = ((profit / sale) * 100).toFixed(1);
    return `<span class="profit-blue">${gp}%</span>`;
}

// Calculate markup with editable margins
function calculateMarkup(cost, marginPercent) {
    const margin = marginPercent / 100;
    const markup = cost * margin;
    const total = cost + markup;
    return {
        cost: cost,
        markup: markup,
        total: total,
        marginPercent: marginPercent
    };
}

// Update margin controls
function updateMargin(section, value) {
    margins[section] = parseFloat(value);
    
    // Trigger recalculation based on section
    switch(section) {
        case 'equipment':
            if (typeof updateEquipmentSummary === 'function') updateEquipmentSummary();
            break;
        case 'materials':
            if (typeof calculatePipework === 'function') calculatePipework();
            break;
        case 'overall':
            updateMainTotal();
            break;
    }
}

// Main total calculation with all color coding
function updateMainTotal() {
    const subTotal = totals.equipment + totals.materials + totals.labour + totals.hire;
    const totalCosts = totals.equipmentCost + totals.materialsCost + totals.labourCost + totals.hireCost;
    
    // Apply overall margin adjustment
    const overallAdjustment = subTotal * (margins.overall / 100);
    let finalTotal = subTotal + overallAdjustment;
    
    // Check for manual override
    const overrideInput = document.getElementById('price-override');
    if (overrideInput && parseFloat(overrideInput.value) > 0) {
        finalTotal = parseFloat(overrideInput.value);
    }
    
    const totalProfit = finalTotal - totalCosts;
    const overallGP = formatGPPercentage(totalProfit, finalTotal);
    
    // Update summary displays with color coding
    updateSummaryElement('total-equipment', formatPrice(totals.equipment));
    updateSummaryElement('total-materials', formatPrice(totals.materials));
    updateSummaryElement('total-labour', formatPrice(totals.labour));
    updateSummaryElement('total-hire', formatPrice(totals.hire));
    updateSummaryElement('sub-total', formatPrice(subTotal));
    updateSummaryElement('total-costs', formatCost(totalCosts));
    updateSummaryElement('total-profit', formatProfit(totalProfit) + ' ' + overallGP);
    updateSummaryElement('grand-total', formatPrice(finalTotal));
    
    return {
        subTotal,
        totalCosts,
        totalProfit,
        finalTotal,
        overallGP: ((totalProfit / finalTotal) * 100).toFixed(1)
    };
}

// Helper function to safely update elements
function updateSummaryElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = content;
    }
}

// Breakdown item generator with color coding
function createBreakdownItem(label, amount, type = 'cost') {
    let formattedAmount;
    switch(type) {
        case 'cost':
            formattedAmount = formatCost(amount);
            break;
        case 'profit':
            formattedAmount = formatProfit(amount);
            break;
        case 'price':
            formattedAmount = formatPrice(amount);
            break;
        default:
            formattedAmount = `£${amount.toFixed(2)}`;
    }
    
    return `
        <div class="breakdown-item">
            <span>${label}:</span>
            ${formattedAmount}
        </div>
    `;
}

// Navigation functions
function navigateToPage(page) {
    window.location.href = page;
}

function goHome() {
    window.location.href = 'index.html';
}

// Form validation
function validateNumericInput(input, min = 0, max = 999999) {
    const value = parseFloat(input.value);
    if (isNaN(value) || value < min || value > max) {
        input.style.borderColor = '#dc3545';
        return false;
    }
    input.style.borderColor = '#28a745';
    return true;
}

// Local storage functions (for preserving data between pages)
function saveToStorage(key, data) {
    try {
        localStorage.setItem(`oracle_${key}`, JSON.stringify(data));
    } catch (e) {
        console.warn('Could not save to localStorage:', e);
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(`oracle_${key}`);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.warn('Could not load from localStorage:', e);
        return defaultValue;
    }
}

// Equipment capacity and pipe sizing logic
function getPipeSizing(capacity) {
    if (capacity <= 2.5) return { 
        size: '1/4" & 3/8"', 
        liquidCost: 4.25, 
        gasCost: 5.85,
        maxRun: 15,
        maxTotal: 30
    };
    if (capacity <= 3.5) return { 
        size: '1/4" & 3/8"', 
        liquidCost: 4.25, 
        gasCost: 5.85,
        maxRun: 15,
        maxTotal: 30
    };
    if (capacity <= 5.0) return { 
        size: '3/8" & 1/2"', 
        liquidCost: 5.85, 
        gasCost: 7.45,
        maxRun: 20,
        maxTotal: 40
    };
    if (capacity <= 7.1) return { 
        size: '3/8" & 5/8"', 
        liquidCost: 5.85, 
        gasCost: 9.25,
        maxRun: 25,
        maxTotal: 50
    };
    if (capacity <= 9.0) return { 
        size: '1/2" & 5/8"', 
        liquidCost: 7.45, 
        gasCost: 9.25,
        maxRun: 30,
        maxTotal: 60
    };
    if (capacity <= 12.0) return { 
        size: '5/8" & 3/4"', 
        liquidCost: 9.25, 
        gasCost: 12.85,
        maxRun: 35,
        maxTotal: 70
    };
    return { 
        size: '3/4" & 7/8"', 
        liquidCost: 12.85, 
        gasCost: 18.45,
        maxRun: 40,
        maxTotal: 80
    };
}

// Pipe run validation with warnings
function validatePipeRuns(runs, lengthPerRun, capacity) {
    const pipeInfo = getPipeSizing(capacity);
    const totalLength = runs * lengthPerRun;
    
    let warnings = [];
    
    if (lengthPerRun > pipeInfo.maxRun) {
        warnings.push(`⚠️ Individual run ${lengthPerRun}m exceeds ${pipeInfo.maxRun}m limit for ${capacity}kW`);
    }
    
    if (totalLength > pipeInfo.maxTotal) {
        warnings.push(`⚠️ Total length ${totalLength}m exceeds ${pipeInfo.maxTotal}m limit for ${capacity}kW`);
    }
    
    return {
        isValid:
