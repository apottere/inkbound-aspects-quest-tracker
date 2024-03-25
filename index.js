/**
 * @typedef {Object} Ascension
 * @property {any=} node
 * @property {string} key
 * @property {string} name
 */

/**
 * @typedef {Object} Augment
 * @property {any=} node
 * @property {string} key
 * @property {string} name
 * @property {string} rarity
 */

/**
 * @typedef {Object} Binding
 * @property {string} key
 * @property {string} name
 * @property {Augment[]} augments
 * @property {Ascension[]} ascensions
 */

/**
 * @typedef {Object} Section
 * @property {any} node
 * @property {number} index
 * @property {string} name
 * @property {Binding[]} bindings
 */

/**
 * @typedef {Object} State
 * @property {Record<string, boolean>} expanded
 * @property {Record<string, boolean>} completed
 */

(() => {
    const defaultExpanded = false;
    const localstorageKey = 'inkbound-aspects-quest-tracker';
    /** @type {State} */
    const state = JSON.parse(localStorage.getItem(localstorageKey) || '{}');
    if (!state.expanded) state.expanded = {};
    if (!state.completed) state.completed = {};

    const BINDING_NAMES = [
        {
            aspect: 'Chainbreaker',
            bindings: [
                'Runic Strike',
                'Infused Fist',
                'Eruption',
            ],
        },
        {
            aspect: 'Clairvoyent',
            bindings: [
                'Telekinesis',
                'Psychic Pulse',
                'Spirit Bomb',
            ],
        },
        {
            aspect: 'Godkeeper',
            bindings: [
                'Impale',
                'Celestial Spear',
                'Whirlwind',
            ],
        },
        {
            aspect: 'Magma Miner',
            bindings: [
                'Bonk',
                'Leaping Strike',
                'Smash',
            ],
        },
        {
            aspect: 'Mosscloak',
            bindings: [
                'Throw',
                'Scavenger\'s Dash',
                'Flurry',
            ],
        },
        {
            aspect: 'Obelisk',
            bindings: [
                'Ironclap',
                'Shield Bash',
                'Seismic Slam',
            ],
        },
        {
            aspect: 'Star Captain',
            bindings: [
                'Chillazer',
                'Mission Leader',
                'Cryoclasm',
            ],
        },
        {
            aspect: 'Weaver',
            bindings: [
                'Thread',
                'Constrict',
                'Stitch',
            ],
        },
        {
            aspect: 'General Bindings, Part 1',
            bindings: [
                'Afterimage',
                'Blink',
                'Cleave',
                'Cone of Frost',
            ],
        },
        {
            aspect: 'General Bindings, Part 2',
            bindings: [
                'Cultivate',
                'Grasp',
                'Incendiary',
                'Invigorate',
            ],
        },
        {
            aspect: 'General Bindings, Part 3',
            bindings: [
                'Jinx',
                'Lightning Bolt',
                'Pilfer',
                'Poison Vapor',
            ],
        },
        {
            aspect: 'General Bindings, Part 4',
            bindings: [
                'Quicken',
                'Restoration',
                'Shield Wall',
                'Smoke Bomb',
            ],
        },
    ]

    /** @type {Section[]} */
    const sections = [];
    const sectionNodes = document.querySelectorAll('div.subSectionTitle');
    console.log('sections:', sections, sectionNodes);

    function addSection(node) {
        const sectionName = node.textContent.trim();
        const sectionIndex = BINDING_NAMES.findIndex(({ aspect }) => aspect === sectionName);
        const bindingNames = BINDING_NAMES[sectionIndex];
        if (bindingNames === undefined) {
            return [null, null];
        }

        const displayName = sectionName.includes('General Bindings') ? 'Shared' : sectionName;

        if (displayName === 'Shared') {
            const existing = sections.find(section => section.name === 'Shared');
            if (existing !== undefined) {
                return [existing, bindingNames.bindings];
            }
        }

        /** @type {Binding[]} */
        const bindings = [];
        /** @type {Section} */
        const section = { node, index: sectionIndex, name: displayName, bindings };
        sections.push(section);

        return [section, bindingNames.bindings];
    }

    for (const sectionNode of sectionNodes) {
        const [section, bindingNames] = addSection(sectionNode);
        if (section === null || bindingNames === null) {
            continue;
        }

        const sectionBody = sectionNode.nextElementSibling;
        const tableNodes = sectionBody.querySelectorAll('div.bb_table');

        console.log('section:', section.name, sectionBody, tableNodes);

        for (let i = 0; i < tableNodes.length / 2; i++) {
            const bindingName = bindingNames[i];
            const augmentNodes = tableNodes[i * 2].querySelectorAll('div.bb_table_tr');
            const ascensionNodes = tableNodes[(i * 2) + 1].querySelectorAll('div.bb_table_tr');

            console.log('binding:', bindingName, ascensionNodes, augmentNodes);

            const bindingKey = `${section.name}/${bindingName}`;

            /** @type {Ascension[]} */
            const ascensions = [];
            /** @type {Augment[]} */
            const augments = [];
            /** @type {Binding} */
            const binding = { key: bindingKey, name: bindingName, ascensions, augments };
            section.bindings.push(binding);

            for (const node of ascensionNodes) {
                const tds = node.querySelectorAll('div.bb_table_td');
                if (tds.length < 1) {
                    continue;
                }

                const name = tds[0].textContent.trim();
                const key = `${section.name}/${bindingName}/${name}`;
                /** @type {Ascension} */
                const ascension = { node, key, name };
                ascensions.push(ascension);
            }

            for (const node of augmentNodes) {
                const tds = node.querySelectorAll('div.bb_table_td');
                if (tds.length < 3) {
                    continue;
                }
                const name = tds[0].textContent.trim();
                const rarity = tds[2].textContent.trim();
                const key = `${section.name}/${bindingName}/${name}`;
                /** @type {Augment} */
                const augment = { node, key, name, rarity };
                augments.push(augment);
            }
        }
    }

    sections.sort((a, b) => a.index - b.index);
    console.log(JSON.stringify(sections));

    const colors = {
        'Uncommon': 'rgb(17,149,36)',
        'UncommonUnique': 'rgb(17,149,36)',
        'Rare': 'rgb(43,142,189)',
        'RareUnique': 'rgb(43,142,189)',
        'Epic': 'rgb(146,61,188)',
        'EpicUnique': 'rgb(146,61,188)',
    }

    const id = 'inkbound-aspects-quest-tracker';
    const root = document.createElement('div');
    root.id = id;
    root.style.position = 'fixed';
    root.style.top = '0';
    root.style.right = '0';
    root.style.bottom = '0';
    root.style.background = 'rgb(49, 45, 56)';
    root.style.color = 'white';
    root.style.padding = '1rem';
    root.style.zIndex = '9999';
    root.style.overflowY = 'auto';

    const decorateBindingExpansion = (key, toggleNode, childrenNode) => {
        const expanded = state.expanded[key] ?? defaultExpanded;
        if (expanded) {
            toggleNode.style.transform = 'rotate(0deg)';
            childrenNode.style.display = 'block';
        } else {
            toggleNode.style.transform = 'rotate(-90deg)';
            childrenNode.style.display = 'none';
        }
    }

    const decorateBindingCompletion = (binding, nameNode) => {
        const completed = binding.ascensions.every(ascension => state.completed[ascension.key] ?? false) &&
            binding.augments.every(augment => state.completed[augment.key] ?? false);

        if (completed) {
            nameNode.style.textDecoration = 'line-through';
            nameNode.style.opacity = '0.25';
        } else {
            nameNode.style.textDecoration = 'none';
            nameNode.style.opacity = '1';
        }
    }

    const toggleBindingExpansion = (key, toggleNode, childrenNode) => {
        state.expanded[key] = !(state.expanded[key] ?? defaultExpanded);

        decorateBindingExpansion(key, toggleNode, childrenNode);
        localStorage.setItem(localstorageKey, JSON.stringify(state));
    };

    const decorateLeafCompleted = (key, node) => {
        const completed = state.completed[key] ?? false;
        if (completed) {
            node.style.textDecoration = 'line-through';
            node.style.opacity = '0.25';
        } else {
            node.style.textDecoration = 'none';
            node.style.opacity = '1';
        }
    }

    const toggleLeafCompleted = (binding, bindingNameNode, key, node) => {
        state.completed[key] = !(state.completed[key] ?? false);

        decorateLeafCompleted(key, node);
        decorateBindingCompletion(binding, bindingNameNode);
        localStorage.setItem(localstorageKey, JSON.stringify(state));
    }

    for (const section of sections) {
        for (const binding of section.bindings) {
            const bindingNode = document.createElement('div');
            root.appendChild(bindingNode);

            const bindingNameNode = document.createElement('div');
            bindingNode.appendChild(bindingNameNode);

            bindingNameNode.style.userSelect = 'none';
            bindingNameNode.style.marginTop = '0.5rem';
            bindingNameNode.style.fontWeight = 'bold';
            bindingNameNode.style.cursor = 'pointer';

            const bindingNameToggle = document.createElement('span');
            bindingNameNode.appendChild(bindingNameToggle);

            bindingNameToggle.textContent = '▼';
            bindingNameToggle.style.display = 'inline-block';
            bindingNameToggle.style.transition = 'transform 0.1s';

            const bindingNameText = document.createElement('span');
            bindingNameNode.appendChild(bindingNameText);
            bindingNameText.textContent = `${section.name}: ${binding.name}`;
            bindingNameText.style.marginLeft = '0.5rem';

            const bindingChildren = document.createElement('div');
            bindingNode.appendChild(bindingChildren);

            decorateBindingExpansion(binding.key, bindingNameToggle, bindingChildren);
            decorateBindingCompletion(binding, bindingNameNode);
            bindingNameNode.onclick = () => {
                toggleBindingExpansion(binding.key, bindingNameToggle, bindingChildren);
            };

            for (const ascension of binding.ascensions) {
                const ascensionNode = document.createElement('div');
                bindingChildren.appendChild(ascensionNode);
                ascensionNode.textContent = ascension.name;
                ascensionNode.style.userSelect = 'none';
                ascensionNode.style.color = 'rgb(244,170,2)';
                ascensionNode.style.marginLeft = '2rem';
                ascensionNode.style.cursor = 'pointer';

                decorateLeafCompleted(ascension.key, ascensionNode);
                ascensionNode.onclick = () => {
                    toggleLeafCompleted(binding, bindingNameNode, ascension.key, ascensionNode);
                };
            }

            for (const augment of binding.augments) {
                const augmentNode = document.createElement('div');
                bindingChildren.appendChild(augmentNode);
                augmentNode.textContent = `${augment.name}`;
                augmentNode.style.userSelect = 'none';
                augmentNode.style.color = colors[augment.rarity];
                augmentNode.style.marginLeft = '2rem';
                augmentNode.style.cursor = 'pointer';

                decorateLeafCompleted(augment.key, augmentNode);
                augmentNode.onclick = () => {
                    toggleLeafCompleted(binding, bindingNameNode, augment.key, augmentNode);
                };
            }
        }
    }

    document.getElementById(id)?.remove();
    document.body.appendChild(root);
})();
