const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'template.html');
const dataPath = path.join(__dirname, 'data.json');
const outputDir = path.join(__dirname, 'dist');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const template = fs.readFileSync(templatePath, 'utf8');
const devices = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

function getAssetFile(folderPath, baseName, extensions = ['.svg', '.png']) {
    try {
        if (!fs.existsSync(folderPath)) return null;
        const files = fs.readdirSync(folderPath);
        for (const ext of extensions) {
            const found = files.find(f => f.toLowerCase() === (baseName + ext).toLowerCase());
            if (found) return found;
        }
    } catch (e) {}
    return null;
}

devices.forEach(device => {
    let content = template;
    const deviceFolderPath = path.join(__dirname, 'images', device.folder);

    content = content.replace(/{{FOLDER}}/g, device.folder);
    content = content.replace(/{{TITLE}}/g, device.title);
    content = content.replace(/{{SUBTITLE}}/g, device.subtitle);
    content = content.replace(/{{REF}}/g, device.ref);
    content = content.replace(/{{HERO_DESCRIPTION}}/g, device.heroDescription);

    content = content.replace(/{{HERO_IMAGE_FILE}}/g, getAssetFile(deviceFolderPath, 'hero-image') || 'hero-image.png');
    content = content.replace(/{{OVERVIEW_IMAGE_FILE}}/g, getAssetFile(deviceFolderPath, 'overview-image') || 'overview-image.png');

    let topologySection = "";
    const topoImageFile = getAssetFile(deviceFolderPath, 'system-topology-image');
    const topoImagePath = topoImageFile ? path.join(deviceFolderPath, topoImageFile) : null;
    const hasTopoImage = topoImagePath ? fs.existsSync(topoImagePath) : false;

    if (device.topologyLayout === 'kallos' && device.topologyItems) {
        const topItems = device.topologyItems.slice(0, 2).map(item => `
            <div class="topology-kallos-item small">
                <img src="../images/${device.folder}/${item.image}" alt="" class="topology-kallos-img">
                <div class="topology-kallos-text-box">
                    <p class="topology-kallos-text">${item.text}</p>
                </div>
            </div>
        `).join("");
        const bottomItem = device.topologyItems[2] ? `
            <div class="topology-kallos-item large">
                <img src="../images/${device.folder}/${device.topologyItems[2].image}" alt="" class="topology-kallos-img">
                <div class="topology-kallos-text-box">
                    <p class="topology-kallos-text">${device.topologyItems[2].text}</p>
                </div>
            </div>
        ` : "";

        topologySection = `
            <section class="topology-section">
                <h2 class="topology-title">System Topology &mdash; ${device.subtitle} Deployment</h2>
                <div class="topology-layout-kallos">
                    <div class="topology-kallos-top">${topItems}</div>
                    ${bottomItem}
                </div>
            </section>
        `;
    } else if (device.topologyLayout === 'colors' && device.colors) {
        const colorItems = device.colors.map(color => `
            <div class="color-item">
                <div class="color-img-container">
                    <img src="../images/${device.folder}/${color.image}" alt="${color.name}">
                </div>
                <span class="color-name">${color.name}</span>
            </div>
        `).join("");

        topologySection = `
            <section class="topology-section">
                <h2 class="topology-title">COLORS</h2>
                <div class="colors-layout">${colorItems}</div>
            </section>
        `;
    } else if (hasTopoImage) {
        const deploymentTip = device.deploymentTip || "Ideal for tracking and monitoring critical assets or individuals throughout the facility. Deploy in accordance with the community's layout to ensure full coverage and reliable alert delivery via the Rythmos® mesh infrastructure.";
        topologySection = `
            <section class="topology-section">
                <h2 class="topology-title">System Topology &mdash; ${device.subtitle} Deployment</h2>
                <div class="topology-container">
                    <div class="topology-diagram">
                        <img src="../images/${device.folder}/${topoImageFile}" alt="System Topology Diagram">
                    </div>
                    <div class="deployment-tip-box">
                        <div class="deployment-tip-inner">
                            <p class="deployment-tip-text">${deploymentTip}</p>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
    content = content.replace(/{{TOPOLOGY_SECTION}}/g, topologySection);

    let heroBottomContent = "";
    if (device.detectionCapabilities && device.detectionCapabilities.length > 0) {
        const heroIconsPath = path.join(deviceFolderPath, 'icons', 'hero');
        const badges = device.detectionCapabilities.map((icon, idx) => {
            const iconFile = getAssetFile(heroIconsPath, (idx + 1).toString());
            const iconHtml = iconFile ? `<div class="badge-icon"><img src="../images/${device.folder}/icons/hero/${iconFile}" alt=""></div>` : "";
            return `
                <div class="badge">
                    ${iconHtml}
                    <span class="badge-text">${icon}</span>
                </div>
            `;
        }).join("");
        heroBottomContent = `<div class="badge-container">${badges}</div>`;
    }
    content = content.replace(/{{HERO_BOTTOM_CONTENT}}/g, heroBottomContent);

    let detectionHtml = "";
    if (device.heroIcons && device.heroIcons.length > 0) {
        const listItems = device.heroIcons.map((cap) => `
            <div class="detection-item">
                <span class="detection-text">${cap}</span>
            </div>
        `).join("");
        detectionHtml = `
            <div class="detection-capabilities-box">
                <h3 class="detection-title">FUNCTIONS</h3>
                <div class="detection-list">${listItems}</div>
            </div>
        `;
    }
    content = content.replace(/{{DETECTION_CAPABILITIES}}/g, detectionHtml);

    const capTitle = device.capabilitiesTitle || "Key Capabilities";
    content = content.replace(/{{CAPABILITIES_TITLE}}/g, capTitle);

    let capabilitiesGrid = "";
    if (device.capabilities && device.capabilities.length > 0) {
        const capIconsPath = path.join(deviceFolderPath, 'icons', 'key-capabilities');
        const rows = [];
        for (let i = 0; i < device.capabilities.length; i += 3) {
            const rowItems = device.capabilities.slice(i, i + 3);
            const cards = rowItems.map((cap, idx) => {
                const iconFile = getAssetFile(capIconsPath, (i + idx + 1).toString());
                return `
                    <div class="capability-card">
                        <img src="../images/${device.folder}/icons/key-capabilities/${iconFile}" alt="" class="capability-icon">
                        <h3 class="capability-name">${cap.name.replace(" ", "<br>")}</h3>
                        <div class="capability-divider"></div>
                        <p class="capability-desc">${cap.desc.replace(" ", "<br>")}</p>
                    </div>
                    ${idx < rowItems.length - 1 ? '<div class="vertical-divider"></div>' : ''}
                `;
            }).join("");
            rows.push(`<div class="capability-row">${cards}</div>`);
            if (i + 3 < device.capabilities.length) {
                rows.push('<div class="horizontal-divider"></div>');
            }
        }
        capabilitiesGrid = rows.join("");
    }
    content = content.replace(/{{CAPABILITIES_GRID}}/g, capabilitiesGrid);

    let specsSection = "";
    if (device.specs && device.specs.length > 0) {
        const rows = [];
        for (let i = 0; i < device.specs.length; i += 2) {
            const pair = device.specs.slice(i, i + 2);
            const items = pair.map(spec => `
                <div class="spec-item">
                    <span class="spec-label">${spec.label}</span>
                    <span class="spec-value">${spec.value}</span>
                </div>
            `).join("");
            rows.push(`<div class="specs-row">${items}</div>`);
        }
        specsSection = `
            <section class="specs-section">
                <h2 class="specs-title">Hardware Specifications</h2>
                <div class="specs-content">
                    ${rows.join("")}
                </div>
            </section>
        `;
    }
    content = content.replace(/{{SPECS_SECTION}}/g, specsSection);

    let featuresHtml = "";
    if (device.networkFeatures && device.networkFeatures.length > 0) {
        const listItems = device.networkFeatures.map(feature => {
            const [bold, rest] = feature.split(": ");
            return `
                <div class="network-item">
                    <p class="network-main-text">${bold}${rest ? ': ' + rest : ''}</p>
                </div>
            `;
        });
        
        const rows = [];
        for (let i = 0; i < listItems.length; i += 2) {
            rows.push(`<div class="network-row">${listItems.slice(i, i+2).join("")}</div>`);
        }

        featuresHtml = `
            <section class="network-section">
                <h2 class="network-title">Network & Location Features</h2>
                <div class="network-grid">${rows.join("")}</div>
            </section>
        `;
    } else if (device.systemSafetyFeatures && device.systemSafetyFeatures.length > 0) {
        const listItems = device.systemSafetyFeatures.map(feature => {
            const [bold, rest] = feature.split(": ");
            return `
                <div class="safety-item">
                    <p class="safety-main-text"><strong>${bold}:</strong> ${rest || ""}</p>
                </div>
            `;
        });
        
        const rows = [];
        for (let i = 0; i < listItems.length; i += 2) {
            rows.push(`<div class="safety-row">${listItems.slice(i, i+2).join("")}</div>`);
        }

        featuresHtml = `
            <section class="safety-section">
                <h2 class="safety-title">System & Safety Features</h2>
                <div class="safety-grid">${rows.join("")}</div>
            </section>
        `;
    }
    content = content.replace(/{{FEATURES_SECTION}}/g, featuresHtml);

    let installationGrid = "";
    if (device.installation && device.installation.length > 0) {
        installationGrid = device.installation.map(item => `
            <div class="installation-item">
                <h3 class="installation-item-title">${item.title}</h3>
                <p class="installation-item-content">${item.content.replace(/\n/g, "<br>")}</p>
            </div>
        `).join("");
    }
    content = content.replace(/{{INSTALLATION_GRID}}/g, installationGrid);

    const fileName = `${device.id}.html`;
    fs.writeFileSync(path.join(outputDir, fileName), content);
    console.log(`Generated: ${fileName}`);
});

console.log('\nSuccess! All 21 pages are in the /dist folder.');
