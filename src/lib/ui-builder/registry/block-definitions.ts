import type { ComponentLayer, BlockDefinition, BlockRegistry } from '@/components/ui/ui-builder/types';

// Re-export types for backward compatibility
export type { BlockDefinition, BlockRegistry } from '@/components/ui/ui-builder/types';

/**
 * Helper to create a simple text span layer
 */
const textSpan = (id: string, text: string): ComponentLayer => ({
    id,
    type: "span",
    name: "span",
    props: {},
    children: text,
});

/**
 * Helper to create a div container
 */
const divContainer = (id: string, className: string, children: ComponentLayer[]): ComponentLayer => ({
    id,
    type: "div",
    name: "div",
    props: { className },
    children,
});

// ============================================
// LOGIN BLOCKS
// ============================================
const loginBlocks: BlockDefinition[] = [
    {
        name: "login-01",
        category: "login",
        description: "Simple login form with email and password",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardFooter", "Input", "Button", "Label"],
        template: {
            id: "login-01-root",
            type: "Card",
            name: "Login Form",
            props: { className: "w-full max-w-sm" },
            children: [
                {
                    id: "login-01-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: {},
                    children: [
                        { id: "login-01-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("login-01-title-text", "Login")] },
                        { id: "login-01-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("login-01-desc-text", "Enter your credentials to access your account")] },
                    ],
                },
                {
                    id: "login-01-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "space-y-4" },
                    children: [
                        divContainer("login-01-email-group", "space-y-2", [
                            { id: "login-01-email-label", type: "Label", name: "Label", props: { htmlFor: "email" }, children: "Email" },
                            { id: "login-01-email-input", type: "Input", name: "Input", props: { type: "email", placeholder: "m@example.com", id: "email" }, children: [] },
                        ]),
                        divContainer("login-01-password-group", "space-y-2", [
                            { id: "login-01-password-label", type: "Label", name: "Label", props: { htmlFor: "password" }, children: "Password" },
                            { id: "login-01-password-input", type: "Input", name: "Input", props: { type: "password", id: "password" }, children: [] },
                        ]),
                    ],
                },
                {
                    id: "login-01-footer",
                    type: "CardFooter",
                    name: "CardFooter",
                    props: {},
                    children: [
                        { id: "login-01-button", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("login-01-btn-text", "Sign In")] },
                    ],
                },
            ],
        },
    },
    {
        name: "login-02",
        category: "login",
        description: "Login form with social login options",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardFooter", "Input", "Button", "Label", "Separator"],
        template: {
            id: "login-02-root",
            type: "Card",
            name: "Login Form with Social",
            props: { className: "w-full max-w-sm" },
            children: [
                {
                    id: "login-02-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: { className: "text-center" },
                    children: [
                        { id: "login-02-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("login-02-title-text", "Welcome back")] },
                        { id: "login-02-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("login-02-desc-text", "Sign in to your account")] },
                    ],
                },
                {
                    id: "login-02-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "space-y-4" },
                    children: [
                        { id: "login-02-google-btn", type: "Button", name: "Button", props: { variant: "outline", className: "w-full" }, children: [textSpan("login-02-google-text", "Continue with Google")] },
                        { id: "login-02-github-btn", type: "Button", name: "Button", props: { variant: "outline", className: "w-full" }, children: [textSpan("login-02-github-text", "Continue with GitHub")] },
                        divContainer("login-02-divider", "relative", [
                            { id: "login-02-separator", type: "Separator", name: "Separator", props: {}, children: [] },
                            { id: "login-02-or", type: "span", name: "span", props: { className: "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground" }, children: "OR" },
                        ]),
                        divContainer("login-02-email-group", "space-y-2", [
                            { id: "login-02-email-label", type: "Label", name: "Label", props: { htmlFor: "email" }, children: "Email" },
                            { id: "login-02-email-input", type: "Input", name: "Input", props: { type: "email", placeholder: "m@example.com", id: "email" }, children: [] },
                        ]),
                        divContainer("login-02-password-group", "space-y-2", [
                            { id: "login-02-password-label", type: "Label", name: "Label", props: { htmlFor: "password" }, children: "Password" },
                            { id: "login-02-password-input", type: "Input", name: "Input", props: { type: "password", id: "password" }, children: [] },
                        ]),
                    ],
                },
                {
                    id: "login-02-footer",
                    type: "CardFooter",
                    name: "CardFooter",
                    props: {},
                    children: [
                        { id: "login-02-button", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("login-02-btn-text", "Sign In")] },
                    ],
                },
            ],
        },
    },
    {
        name: "login-03",
        category: "login",
        description: "Two-column login with image",
        requiredComponents: ["Card", "Input", "Button", "Label"],
        template: divContainer("login-03-root", "grid min-h-[400px] grid-cols-2 overflow-hidden rounded-lg border", [
            divContainer("login-03-image", "hidden bg-muted lg:block", [
                { id: "login-03-img", type: "img", name: "img", props: { src: "https://placehold.co/600x400", alt: "Login image", className: "h-full w-full object-cover" }, children: [] },
            ]),
            divContainer("login-03-form", "flex items-center justify-center p-8", [
                divContainer("login-03-form-inner", "w-full max-w-sm space-y-6", [
                    divContainer("login-03-header", "space-y-2 text-center", [
                        { id: "login-03-title", type: "h1", name: "h1", props: { className: "text-2xl font-bold" }, children: "Sign In" },
                        { id: "login-03-subtitle", type: "p", name: "p", props: { className: "text-muted-foreground" }, children: "Enter your email below to sign in" },
                    ]),
                    divContainer("login-03-fields", "space-y-4", [
                        divContainer("login-03-email-group", "space-y-2", [
                            { id: "login-03-email-label", type: "Label", name: "Label", props: { htmlFor: "email" }, children: "Email" },
                            { id: "login-03-email-input", type: "Input", name: "Input", props: { type: "email", placeholder: "m@example.com", id: "email" }, children: [] },
                        ]),
                        divContainer("login-03-password-group", "space-y-2", [
                            { id: "login-03-password-label", type: "Label", name: "Label", props: { htmlFor: "password" }, children: "Password" },
                            { id: "login-03-password-input", type: "Input", name: "Input", props: { type: "password", id: "password" }, children: [] },
                        ]),
                        { id: "login-03-button", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("login-03-btn-text", "Sign In")] },
                    ]),
                ]),
            ]),
        ]),
    },
    {
        name: "login-04",
        category: "login",
        description: "Minimal login form",
        requiredComponents: ["Input", "Button", "Label"],
        template: divContainer("login-04-root", "flex min-h-[350px] items-center justify-center", [
            divContainer("login-04-form", "w-full max-w-sm space-y-6", [
                divContainer("login-04-header", "space-y-2 text-center", [
                    { id: "login-04-title", type: "h1", name: "h1", props: { className: "text-3xl font-bold" }, children: "Login" },
                ]),
                divContainer("login-04-fields", "space-y-4", [
                    { id: "login-04-email-input", type: "Input", name: "Input", props: { type: "email", placeholder: "Email" }, children: [] },
                    { id: "login-04-password-input", type: "Input", name: "Input", props: { type: "password", placeholder: "Password" }, children: [] },
                    { id: "login-04-button", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("login-04-btn-text", "Sign In")] },
                ]),
                divContainer("login-04-footer", "text-center text-sm", [
                    { id: "login-04-footer-text", type: "span", name: "span", props: { className: "text-muted-foreground" }, children: "Don't have an account? " },
                    { id: "login-04-signup-link", type: "a", name: "a", props: { href: "#", className: "underline" }, children: [textSpan("login-04-signup-text", "Sign up")] },
                ]),
            ]),
        ]),
    },
    {
        name: "login-05",
        category: "login",
        description: "Login with remember me and forgot password",
        requiredComponents: ["Card", "Input", "Button", "Label", "Checkbox"],
        template: {
            id: "login-05-root",
            type: "Card",
            name: "Login Form Extended",
            props: { className: "w-full max-w-md" },
            children: [
                {
                    id: "login-05-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: {},
                    children: [
                        { id: "login-05-title", type: "CardTitle", name: "CardTitle", props: { className: "text-2xl" }, children: [textSpan("login-05-title-text", "Login")] },
                        { id: "login-05-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("login-05-desc-text", "Enter your email and password to access your account")] },
                    ],
                },
                {
                    id: "login-05-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "space-y-4" },
                    children: [
                        divContainer("login-05-email-group", "space-y-2", [
                            { id: "login-05-email-label", type: "Label", name: "Label", props: { htmlFor: "email" }, children: "Email" },
                            { id: "login-05-email-input", type: "Input", name: "Input", props: { type: "email", placeholder: "m@example.com", id: "email" }, children: [] },
                        ]),
                        divContainer("login-05-password-group", "space-y-2", [
                            divContainer("login-05-password-header", "flex items-center justify-between", [
                                { id: "login-05-password-label", type: "Label", name: "Label", props: { htmlFor: "password" }, children: "Password" },
                                { id: "login-05-forgot-link", type: "a", name: "a", props: { href: "#", className: "text-sm underline" }, children: [textSpan("login-05-forgot-text", "Forgot password?")] },
                            ]),
                            { id: "login-05-password-input", type: "Input", name: "Input", props: { type: "password", id: "password" }, children: [] },
                        ]),
                        divContainer("login-05-remember", "flex items-center space-x-2", [
                            { id: "login-05-remember-checkbox", type: "Checkbox", name: "Checkbox", props: { id: "remember" }, children: [] },
                            { id: "login-05-remember-label", type: "Label", name: "Label", props: { htmlFor: "remember", className: "text-sm font-normal" }, children: "Remember me" },
                        ]),
                    ],
                },
                {
                    id: "login-05-footer",
                    type: "CardFooter",
                    name: "CardFooter",
                    props: { className: "flex flex-col space-y-4" },
                    children: [
                        { id: "login-05-button", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("login-05-btn-text", "Sign In")] },
                        divContainer("login-05-signup", "text-center text-sm", [
                            { id: "login-05-signup-text", type: "span", name: "span", props: { className: "text-muted-foreground" }, children: "Don't have an account? " },
                            { id: "login-05-signup-link", type: "a", name: "a", props: { href: "#", className: "underline" }, children: [textSpan("login-05-signup-link-text", "Sign up")] },
                        ]),
                    ],
                },
            ],
        },
    },
];

// ============================================
// SIDEBAR BLOCKS
// ============================================
const createSidebarBlock = (num: string, description: string): BlockDefinition => ({
    name: `sidebar-${num}`,
    category: "sidebar",
    description,
    requiredComponents: ["Sidebar", "SidebarHeader", "SidebarContent", "SidebarFooter", "SidebarMenu", "SidebarMenuItem", "SidebarMenuButton"],
    template: {
        id: `sidebar-${num}-root`,
        type: "SidebarProvider",
        name: "Sidebar Layout",
        props: {},
        children: [
            {
                id: `sidebar-${num}-sidebar`,
                type: "Sidebar",
                name: "Sidebar",
                props: {},
                children: [
                    {
                        id: `sidebar-${num}-header`,
                        type: "SidebarHeader",
                        name: "SidebarHeader",
                        props: {},
                        children: [
                            divContainer(`sidebar-${num}-logo`, "flex items-center gap-2 px-4 py-2", [
                                textSpan(`sidebar-${num}-logo-text`, `Sidebar ${num}`),
                            ]),
                        ],
                    },
                    {
                        id: `sidebar-${num}-content`,
                        type: "SidebarContent",
                        name: "SidebarContent",
                        props: {},
                        children: [
                            {
                                id: `sidebar-${num}-group`,
                                type: "SidebarGroup",
                                name: "SidebarGroup",
                                props: {},
                                children: [
                                    { id: `sidebar-${num}-group-label`, type: "SidebarGroupLabel", name: "SidebarGroupLabel", props: {}, children: [textSpan(`sidebar-${num}-gl-text`, "Menu")] },
                                    {
                                        id: `sidebar-${num}-menu`,
                                        type: "SidebarMenu",
                                        name: "SidebarMenu",
                                        props: {},
                                        children: [
                                            {
                                                id: `sidebar-${num}-item-1`,
                                                type: "SidebarMenuItem",
                                                name: "SidebarMenuItem",
                                                props: {},
                                                children: [
                                                    { id: `sidebar-${num}-btn-1`, type: "SidebarMenuButton", name: "SidebarMenuButton", props: {}, children: [textSpan(`sidebar-${num}-btn-1-text`, "Dashboard")] },
                                                ],
                                            },
                                            {
                                                id: `sidebar-${num}-item-2`,
                                                type: "SidebarMenuItem",
                                                name: "SidebarMenuItem",
                                                props: {},
                                                children: [
                                                    { id: `sidebar-${num}-btn-2`, type: "SidebarMenuButton", name: "SidebarMenuButton", props: {}, children: [textSpan(`sidebar-${num}-btn-2-text`, "Settings")] },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    {
                        id: `sidebar-${num}-footer`,
                        type: "SidebarFooter",
                        name: "SidebarFooter",
                        props: {},
                        children: [
                            textSpan(`sidebar-${num}-footer-text`, "Footer"),
                        ],
                    },
                ],
            },
            {
                id: `sidebar-${num}-inset`,
                type: "SidebarInset",
                name: "SidebarInset",
                props: {},
                children: [
                    divContainer(`sidebar-${num}-main`, "p-4", [
                        { id: `sidebar-${num}-trigger`, type: "SidebarTrigger", name: "SidebarTrigger", props: {}, children: [] },
                        textSpan(`sidebar-${num}-main-text`, "Main Content Area"),
                    ]),
                ],
            },
        ],
    },
});

const sidebarBlocks: BlockDefinition[] = [
    createSidebarBlock("01", "Basic sidebar layout"),
    createSidebarBlock("02", "Sidebar with icons"),
    createSidebarBlock("03", "Collapsible sidebar"),
    createSidebarBlock("04", "Sidebar with search"),
    createSidebarBlock("05", "Sidebar with user menu"),
    createSidebarBlock("06", "Multi-level sidebar"),
    createSidebarBlock("07", "Sidebar with badges"),
    createSidebarBlock("08", "Floating sidebar"),
    createSidebarBlock("09", "Inset sidebar"),
    createSidebarBlock("10", "Sidebar with header actions"),
    createSidebarBlock("11", "Grouped sidebar menu"),
    createSidebarBlock("12", "Sidebar with footer actions"),
    createSidebarBlock("13", "Minimal sidebar"),
    createSidebarBlock("14", "Sidebar with notifications"),
    createSidebarBlock("15", "Dark sidebar"),
    createSidebarBlock("16", "Sidebar with logo"),
];

// ============================================
// DASHBOARD BLOCKS
// ============================================
const dashboardBlocks: BlockDefinition[] = [
    {
        name: "dashboard-01",
        category: "dashboard",
        description: "Basic dashboard layout with stats cards",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardTitle", "CardDescription"],
        template: divContainer("dashboard-01-root", "space-y-6", [
            divContainer("dashboard-01-header", "flex items-center justify-between", [
                { id: "dashboard-01-title", type: "h1", name: "h1", props: { className: "text-3xl font-bold" }, children: "Dashboard" },
            ]),
            divContainer("dashboard-01-stats", "grid gap-4 md:grid-cols-2 lg:grid-cols-4", [
                {
                    id: "dashboard-01-stat-1",
                    type: "Card",
                    name: "Card",
                    props: {},
                    children: [
                        {
                            id: "dashboard-01-stat-1-header",
                            type: "CardHeader",
                            name: "CardHeader",
                            props: { className: "pb-2" },
                            children: [
                                { id: "dashboard-01-stat-1-title", type: "CardTitle", name: "CardTitle", props: { className: "text-sm font-medium" }, children: [textSpan("d01-s1-title", "Total Revenue")] },
                            ],
                        },
                        {
                            id: "dashboard-01-stat-1-content",
                            type: "CardContent",
                            name: "CardContent",
                            props: {},
                            children: [
                                { id: "dashboard-01-stat-1-value", type: "p", name: "p", props: { className: "text-2xl font-bold" }, children: "$45,231.89" },
                                { id: "dashboard-01-stat-1-change", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "+20.1% from last month" },
                            ],
                        },
                    ],
                },
                {
                    id: "dashboard-01-stat-2",
                    type: "Card",
                    name: "Card",
                    props: {},
                    children: [
                        {
                            id: "dashboard-01-stat-2-header",
                            type: "CardHeader",
                            name: "CardHeader",
                            props: { className: "pb-2" },
                            children: [
                                { id: "dashboard-01-stat-2-title", type: "CardTitle", name: "CardTitle", props: { className: "text-sm font-medium" }, children: [textSpan("d01-s2-title", "Subscriptions")] },
                            ],
                        },
                        {
                            id: "dashboard-01-stat-2-content",
                            type: "CardContent",
                            name: "CardContent",
                            props: {},
                            children: [
                                { id: "dashboard-01-stat-2-value", type: "p", name: "p", props: { className: "text-2xl font-bold" }, children: "+2,350" },
                                { id: "dashboard-01-stat-2-change", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "+180.1% from last month" },
                            ],
                        },
                    ],
                },
                {
                    id: "dashboard-01-stat-3",
                    type: "Card",
                    name: "Card",
                    props: {},
                    children: [
                        {
                            id: "dashboard-01-stat-3-header",
                            type: "CardHeader",
                            name: "CardHeader",
                            props: { className: "pb-2" },
                            children: [
                                { id: "dashboard-01-stat-3-title", type: "CardTitle", name: "CardTitle", props: { className: "text-sm font-medium" }, children: [textSpan("d01-s3-title", "Sales")] },
                            ],
                        },
                        {
                            id: "dashboard-01-stat-3-content",
                            type: "CardContent",
                            name: "CardContent",
                            props: {},
                            children: [
                                { id: "dashboard-01-stat-3-value", type: "p", name: "p", props: { className: "text-2xl font-bold" }, children: "+12,234" },
                                { id: "dashboard-01-stat-3-change", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "+19% from last month" },
                            ],
                        },
                    ],
                },
                {
                    id: "dashboard-01-stat-4",
                    type: "Card",
                    name: "Card",
                    props: {},
                    children: [
                        {
                            id: "dashboard-01-stat-4-header",
                            type: "CardHeader",
                            name: "CardHeader",
                            props: { className: "pb-2" },
                            children: [
                                { id: "dashboard-01-stat-4-title", type: "CardTitle", name: "CardTitle", props: { className: "text-sm font-medium" }, children: [textSpan("d01-s4-title", "Active Now")] },
                            ],
                        },
                        {
                            id: "dashboard-01-stat-4-content",
                            type: "CardContent",
                            name: "CardContent",
                            props: {},
                            children: [
                                { id: "dashboard-01-stat-4-value", type: "p", name: "p", props: { className: "text-2xl font-bold" }, children: "+573" },
                                { id: "dashboard-01-stat-4-change", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "+201 since last hour" },
                            ],
                        },
                    ],
                },
            ]),
        ]),
    },
];

// ============================================
// CALENDAR BLOCKS (placeholder templates)
// ============================================
const createCalendarBlock = (num: string): BlockDefinition => ({
    name: `calendar-${num}`,
    category: "calendar",
    description: `Calendar variant ${num}`,
    requiredComponents: ["Calendar", "Card"],
    template: {
        id: `calendar-${num}-root`,
        type: "Card",
        name: `Calendar ${num}`,
        props: { className: "w-fit" },
        children: [
            {
                id: `calendar-${num}-content`,
                type: "CardContent",
                name: "CardContent",
                props: { className: "p-4" },
                children: [
                    { id: `calendar-${num}-calendar`, type: "Calendar", name: "Calendar", props: { mode: "single" }, children: [] },
                ],
            },
        ],
    },
});

const calendarBlocks: BlockDefinition[] = Array.from({ length: 32 }, (_, i) => 
    createCalendarBlock(String(i + 1).padStart(2, '0'))
);

// ============================================
// CHART BLOCKS (templates with ChartContainer - charts require Recharts data integration)
// ============================================
const createChartPlaceholder = (name: string, category: string, description: string): BlockDefinition => ({
    name,
    category,
    description,
    requiredComponents: ["Card", "CardHeader", "CardContent", "CardTitle", "CardDescription", "ChartContainer"],
    template: {
        id: `${name}-root`,
        type: "Card",
        name: `${name}`,
        props: {},
        children: [
            {
                id: `${name}-header`,
                type: "CardHeader",
                name: "CardHeader",
                props: {},
                children: [
                    { id: `${name}-title`, type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan(`${name}-title-text`, description)] },
                    { id: `${name}-desc`, type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan(`${name}-desc-text`, "Chart visualization")] },
                ],
            },
            {
                id: `${name}-content`,
                type: "CardContent",
                name: "CardContent",
                props: { className: "h-[300px] flex flex-col items-center justify-center gap-4" },
                children: [
                    divContainer(`${name}-placeholder`, "text-muted-foreground text-center space-y-2", [
                        { id: `${name}-icon`, type: "div", name: "div", props: { className: "text-4xl" }, children: "📊" },
                        textSpan(`${name}-placeholder-text`, description),
                        { id: `${name}-hint`, type: "p", name: "p", props: { className: "text-xs max-w-[250px]" }, children: "Charts require Recharts data integration. Use ChartContainer with AreaChart, BarChart, LineChart, etc." },
                    ]),
                ],
            },
        ],
    },
});

// Chart Area blocks - use AreaChartDemo for the first one, placeholders for variants
const chartAreaBlocks: BlockDefinition[] = [
    {
        name: "chart-area-default",
        category: "chart",
        description: "Default area chart with sample data",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardTitle", "CardDescription", "AreaChartDemo"],
        template: {
            id: "chart-area-default-root",
            type: "Card",
            name: "chart-area-default",
            props: {},
            children: [
                {
                    id: "chart-area-default-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: {},
                    children: [
                        { id: "chart-area-default-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("chart-area-default-title-text", "Area Chart")] },
                        { id: "chart-area-default-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("chart-area-default-desc-text", "Showing desktop and mobile visitors")] },
                    ],
                },
                {
                    id: "chart-area-default-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: {},
                    children: [
                        { id: "chart-area-default-chart", type: "AreaChartDemo", name: "AreaChartDemo", props: {}, children: [] },
                    ],
                },
            ],
        },
    },
    createChartPlaceholder("chart-area-axes", "chart", "Area chart with axes"),
    createChartPlaceholder("chart-area-gradient", "chart", "Area chart with gradient"),
    createChartPlaceholder("chart-area-icons", "chart", "Area chart with icons"),
    createChartPlaceholder("chart-area-interactive", "chart", "Interactive area chart"),
    createChartPlaceholder("chart-area-legend", "chart", "Area chart with legend"),
    createChartPlaceholder("chart-area-linear", "chart", "Linear area chart"),
    createChartPlaceholder("chart-area-stacked", "chart", "Stacked area chart"),
    createChartPlaceholder("chart-area-stacked-expand", "chart", "Expanded stacked area chart"),
    createChartPlaceholder("chart-area-step", "chart", "Step area chart"),
];

// Chart Bar blocks - use BarChartDemo for the first one
const chartBarBlocks: BlockDefinition[] = [
    {
        name: "chart-bar-default",
        category: "chart",
        description: "Default bar chart with sample data",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardTitle", "CardDescription", "BarChartDemo"],
        template: {
            id: "chart-bar-default-root",
            type: "Card",
            name: "chart-bar-default",
            props: {},
            children: [
                {
                    id: "chart-bar-default-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: {},
                    children: [
                        { id: "chart-bar-default-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("chart-bar-default-title-text", "Bar Chart")] },
                        { id: "chart-bar-default-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("chart-bar-default-desc-text", "Showing desktop and mobile visitors")] },
                    ],
                },
                {
                    id: "chart-bar-default-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: {},
                    children: [
                        { id: "chart-bar-default-chart", type: "BarChartDemo", name: "BarChartDemo", props: {}, children: [] },
                    ],
                },
            ],
        },
    },
    createChartPlaceholder("chart-bar-active", "chart", "Bar chart with active state"),
    createChartPlaceholder("chart-bar-horizontal", "chart", "Horizontal bar chart"),
    createChartPlaceholder("chart-bar-interactive", "chart", "Interactive bar chart"),
    createChartPlaceholder("chart-bar-label", "chart", "Bar chart with labels"),
    createChartPlaceholder("chart-bar-label-custom", "chart", "Bar chart with custom labels"),
    createChartPlaceholder("chart-bar-mixed", "chart", "Mixed bar chart"),
    createChartPlaceholder("chart-bar-multiple", "chart", "Multiple bar chart"),
    createChartPlaceholder("chart-bar-negative", "chart", "Bar chart with negative values"),
    createChartPlaceholder("chart-bar-stacked", "chart", "Stacked bar chart"),
];

// Chart Line blocks - use LineChartDemo for the first one
const chartLineBlocks: BlockDefinition[] = [
    {
        name: "chart-line-default",
        category: "chart",
        description: "Default line chart with sample data",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardTitle", "CardDescription", "LineChartDemo"],
        template: {
            id: "chart-line-default-root",
            type: "Card",
            name: "chart-line-default",
            props: {},
            children: [
                {
                    id: "chart-line-default-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: {},
                    children: [
                        { id: "chart-line-default-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("chart-line-default-title-text", "Line Chart")] },
                        { id: "chart-line-default-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("chart-line-default-desc-text", "Showing desktop and mobile visitors")] },
                    ],
                },
                {
                    id: "chart-line-default-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: {},
                    children: [
                        { id: "chart-line-default-chart", type: "LineChartDemo", name: "LineChartDemo", props: {}, children: [] },
                    ],
                },
            ],
        },
    },
    createChartPlaceholder("chart-line-dots", "chart", "Line chart with dots"),
    createChartPlaceholder("chart-line-dots-colors", "chart", "Line chart with colored dots"),
    createChartPlaceholder("chart-line-dots-custom", "chart", "Line chart with custom dots"),
    createChartPlaceholder("chart-line-interactive", "chart", "Interactive line chart"),
    createChartPlaceholder("chart-line-label", "chart", "Line chart with labels"),
    createChartPlaceholder("chart-line-label-custom", "chart", "Line chart with custom labels"),
    createChartPlaceholder("chart-line-linear", "chart", "Linear line chart"),
    createChartPlaceholder("chart-line-multiple", "chart", "Multiple line chart"),
    createChartPlaceholder("chart-line-step", "chart", "Step line chart"),
];

// Chart Pie blocks - use PieChartDemo for the first one
const chartPieBlocks: BlockDefinition[] = [
    {
        name: "chart-pie-donut",
        category: "chart",
        description: "Donut chart with sample data",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardTitle", "CardDescription", "PieChartDemo"],
        template: {
            id: "chart-pie-donut-root",
            type: "Card",
            name: "chart-pie-donut",
            props: {},
            children: [
                {
                    id: "chart-pie-donut-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: {},
                    children: [
                        { id: "chart-pie-donut-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("chart-pie-donut-title-text", "Pie Chart")] },
                        { id: "chart-pie-donut-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("chart-pie-donut-desc-text", "Browser visitors breakdown")] },
                    ],
                },
                {
                    id: "chart-pie-donut-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: {},
                    children: [
                        { id: "chart-pie-donut-chart", type: "PieChartDemo", name: "PieChartDemo", props: {}, children: [] },
                    ],
                },
            ],
        },
    },
    createChartPlaceholder("chart-pie-donut-active", "chart", "Donut chart with active state"),
    createChartPlaceholder("chart-pie-donut-text", "chart", "Donut chart with text"),
    createChartPlaceholder("chart-pie-interactive", "chart", "Interactive pie chart"),
    createChartPlaceholder("chart-pie-label", "chart", "Pie chart with labels"),
    createChartPlaceholder("chart-pie-label-custom", "chart", "Pie chart with custom labels"),
    createChartPlaceholder("chart-pie-label-list", "chart", "Pie chart with label list"),
    createChartPlaceholder("chart-pie-legend", "chart", "Pie chart with legend"),
    createChartPlaceholder("chart-pie-separator-none", "chart", "Pie chart without separator"),
    createChartPlaceholder("chart-pie-simple", "chart", "Simple pie chart"),
    createChartPlaceholder("chart-pie-stacked", "chart", "Stacked pie chart"),
];

// Chart Radar blocks
const chartRadarBlocks: BlockDefinition[] = [
    createChartPlaceholder("chart-radar-default", "chart", "Default radar chart"),
    createChartPlaceholder("chart-radar-dots", "chart", "Radar chart with dots"),
    createChartPlaceholder("chart-radar-grid-circle", "chart", "Radar chart with circle grid"),
    createChartPlaceholder("chart-radar-grid-circle-fill", "chart", "Radar chart with filled circle grid"),
    createChartPlaceholder("chart-radar-grid-circle-no-lines", "chart", "Radar chart circle grid no lines"),
    createChartPlaceholder("chart-radar-grid-custom", "chart", "Radar chart with custom grid"),
    createChartPlaceholder("chart-radar-grid-fill", "chart", "Radar chart with filled grid"),
    createChartPlaceholder("chart-radar-grid-none", "chart", "Radar chart without grid"),
    createChartPlaceholder("chart-radar-icons", "chart", "Radar chart with icons"),
    createChartPlaceholder("chart-radar-label-custom", "chart", "Radar chart with custom labels"),
    createChartPlaceholder("chart-radar-legend", "chart", "Radar chart with legend"),
    createChartPlaceholder("chart-radar-lines-only", "chart", "Radar chart lines only"),
    createChartPlaceholder("chart-radar-multiple", "chart", "Multiple radar chart"),
    createChartPlaceholder("chart-radar-radius", "chart", "Radar chart with radius"),
];

// Chart Radial blocks
const chartRadialBlocks: BlockDefinition[] = [
    createChartPlaceholder("chart-radial-grid", "chart", "Radial chart with grid"),
    createChartPlaceholder("chart-radial-label", "chart", "Radial chart with labels"),
    createChartPlaceholder("chart-radial-shape", "chart", "Radial chart with shapes"),
    createChartPlaceholder("chart-radial-simple", "chart", "Simple radial chart"),
    createChartPlaceholder("chart-radial-stacked", "chart", "Stacked radial chart"),
    createChartPlaceholder("chart-radial-text", "chart", "Radial chart with text"),
];

// Chart Tooltip blocks
const chartTooltipBlocks: BlockDefinition[] = [
    createChartPlaceholder("chart-tooltip-advanced", "chart", "Advanced tooltip chart"),
    createChartPlaceholder("chart-tooltip-default", "chart", "Default tooltip chart"),
    createChartPlaceholder("chart-tooltip-formatter", "chart", "Tooltip with formatter"),
    createChartPlaceholder("chart-tooltip-icons", "chart", "Tooltip with icons"),
    createChartPlaceholder("chart-tooltip-indicator-line", "chart", "Tooltip with line indicator"),
    createChartPlaceholder("chart-tooltip-indicator-none", "chart", "Tooltip without indicator"),
    createChartPlaceholder("chart-tooltip-label-custom", "chart", "Tooltip with custom label"),
    createChartPlaceholder("chart-tooltip-label-formatter", "chart", "Tooltip label formatter"),
    createChartPlaceholder("chart-tooltip-label-none", "chart", "Tooltip without label"),
];

// ============================================
// PROFILE BLOCKS
// ============================================
const profileBlocks: BlockDefinition[] = [
    {
        name: "profile-01",
        category: "profile",
        description: "Profile hero card with avatar and bio",
        requiredComponents: ["Card", "CardHeader", "CardContent", "Avatar", "Badge", "Button"],
        template: {
            id: "profile-01-root",
            type: "Card",
            name: "Profile Hero Card",
            props: { className: "w-full max-w-md" },
            children: [
                {
                    id: "profile-01-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: { className: "flex flex-col items-center text-center pb-2" },
                    children: [
                        {
                            id: "profile-01-avatar",
                            type: "Avatar",
                            name: "Avatar",
                            props: { className: "h-24 w-24 mb-4" },
                            children: [
                                { id: "profile-01-avatar-img", type: "AvatarImage", name: "AvatarImage", props: { src: "https://placehold.co/96x96", alt: "Profile" }, children: [] },
                                { id: "profile-01-avatar-fallback", type: "AvatarFallback", name: "AvatarFallback", props: {}, children: "JD" },
                            ],
                        },
                        { id: "profile-01-name", type: "h2", name: "h2", props: { className: "text-2xl font-bold" }, children: "Jane Doe" },
                        { id: "profile-01-role", type: "p", name: "p", props: { className: "text-muted-foreground" }, children: "Senior Product Designer" },
                        divContainer("profile-01-badges", "flex gap-2 mt-2 flex-wrap justify-center", [
                            { id: "profile-01-badge-1", type: "Badge", name: "Badge", props: { variant: "secondary" }, children: [textSpan("p01-b1", "Design")] },
                            { id: "profile-01-badge-2", type: "Badge", name: "Badge", props: { variant: "secondary" }, children: [textSpan("p01-b2", "UX")] },
                            { id: "profile-01-badge-3", type: "Badge", name: "Badge", props: { variant: "secondary" }, children: [textSpan("p01-b3", "Figma")] },
                        ]),
                    ],
                },
                {
                    id: "profile-01-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "text-center space-y-4" },
                    children: [
                        { id: "profile-01-bio", type: "p", name: "p", props: { className: "text-sm text-muted-foreground" }, children: "Passionate about creating user-centered digital experiences. 8+ years in product design." },
                        divContainer("profile-01-actions", "flex gap-2 justify-center", [
                            { id: "profile-01-btn-follow", type: "Button", name: "Button", props: { className: "flex-1" }, children: [textSpan("p01-follow", "Follow")] },
                            { id: "profile-01-btn-msg", type: "Button", name: "Button", props: { variant: "outline", className: "flex-1" }, children: [textSpan("p01-msg", "Message")] },
                        ]),
                    ],
                },
            ],
        },
    },
    {
        name: "profile-02",
        category: "profile",
        description: "Profile with stats grid",
        requiredComponents: ["Card", "CardHeader", "CardContent", "Avatar", "Separator"],
        template: {
            id: "profile-02-root",
            type: "Card",
            name: "Profile with Stats",
            props: { className: "w-full max-w-lg" },
            children: [
                {
                    id: "profile-02-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: { className: "flex flex-row items-center gap-4" },
                    children: [
                        {
                            id: "profile-02-avatar",
                            type: "Avatar",
                            name: "Avatar",
                            props: { className: "h-16 w-16" },
                            children: [
                                { id: "profile-02-avatar-img", type: "AvatarImage", name: "AvatarImage", props: { src: "https://placehold.co/64x64", alt: "Profile" }, children: [] },
                                { id: "profile-02-avatar-fallback", type: "AvatarFallback", name: "AvatarFallback", props: {}, children: "JS" },
                            ],
                        },
                        divContainer("profile-02-info", "flex flex-col", [
                            { id: "profile-02-name", type: "h3", name: "h3", props: { className: "font-semibold text-lg" }, children: "John Smith" },
                            { id: "profile-02-handle", type: "p", name: "p", props: { className: "text-sm text-muted-foreground" }, children: "@johnsmith" },
                            { id: "profile-02-location", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "San Francisco, CA" },
                        ]),
                    ],
                },
                {
                    id: "profile-02-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "space-y-4" },
                    children: [
                        { id: "profile-02-separator", type: "Separator", name: "Separator", props: {}, children: [] },
                        divContainer("profile-02-stats", "grid grid-cols-3 text-center", [
                            divContainer("profile-02-stat-1", "flex flex-col", [
                                { id: "profile-02-stat-1-val", type: "span", name: "span", props: { className: "text-2xl font-bold" }, children: "248" },
                                { id: "profile-02-stat-1-lbl", type: "span", name: "span", props: { className: "text-xs text-muted-foreground" }, children: "Posts" },
                            ]),
                            divContainer("profile-02-stat-2", "flex flex-col border-x", [
                                { id: "profile-02-stat-2-val", type: "span", name: "span", props: { className: "text-2xl font-bold" }, children: "12.5K" },
                                { id: "profile-02-stat-2-lbl", type: "span", name: "span", props: { className: "text-xs text-muted-foreground" }, children: "Followers" },
                            ]),
                            divContainer("profile-02-stat-3", "flex flex-col", [
                                { id: "profile-02-stat-3-val", type: "span", name: "span", props: { className: "text-2xl font-bold" }, children: "891" },
                                { id: "profile-02-stat-3-lbl", type: "span", name: "span", props: { className: "text-xs text-muted-foreground" }, children: "Following" },
                            ]),
                        ]),
                    ],
                },
            ],
        },
    },
    {
        name: "profile-03",
        category: "profile",
        description: "Horizontal profile card",
        requiredComponents: ["Card", "CardContent", "Avatar", "Badge", "Button"],
        template: {
            id: "profile-03-root",
            type: "Card",
            name: "Horizontal Profile",
            props: { className: "w-full max-w-2xl" },
            children: [
                {
                    id: "profile-03-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "p-6 flex items-start gap-6" },
                    children: [
                        {
                            id: "profile-03-avatar",
                            type: "Avatar",
                            name: "Avatar",
                            props: { className: "h-20 w-20 flex-shrink-0" },
                            children: [
                                { id: "profile-03-avatar-img", type: "AvatarImage", name: "AvatarImage", props: { src: "https://placehold.co/80x80", alt: "Profile" }, children: [] },
                                { id: "profile-03-avatar-fallback", type: "AvatarFallback", name: "AvatarFallback", props: {}, children: "AK" },
                            ],
                        },
                        divContainer("profile-03-details", "flex-1 min-w-0 space-y-2", [
                            divContainer("profile-03-header-row", "flex items-center justify-between", [
                                divContainer("profile-03-name-group", "space-y-0.5", [
                                    { id: "profile-03-name", type: "h3", name: "h3", props: { className: "font-semibold text-lg leading-none" }, children: "Alice Kim" },
                                    { id: "profile-03-title", type: "p", name: "p", props: { className: "text-sm text-muted-foreground" }, children: "Engineering Manager at TechCorp" },
                                ]),
                                { id: "profile-03-btn", type: "Button", name: "Button", props: { size: "sm" }, children: [textSpan("p03-connect", "Connect")] },
                            ]),
                            { id: "profile-03-bio", type: "p", name: "p", props: { className: "text-sm text-muted-foreground line-clamp-2" }, children: "Building world-class engineering teams. Passionate about developer experience and platform reliability." },
                            divContainer("profile-03-tags", "flex flex-wrap gap-1.5", [
                                { id: "p03-tag-1", type: "Badge", name: "Badge", props: { variant: "outline" }, children: [textSpan("p03-t1", "Leadership")] },
                                { id: "p03-tag-2", type: "Badge", name: "Badge", props: { variant: "outline" }, children: [textSpan("p03-t2", "Platform Eng")] },
                                { id: "p03-tag-3", type: "Badge", name: "Badge", props: { variant: "outline" }, children: [textSpan("p03-t3", "DevEx")] },
                            ]),
                        ]),
                    ],
                },
            ],
        },
    },
];

// ============================================
// BLOG BLOCKS
// ============================================
const blogBlocks: BlockDefinition[] = [
    {
        name: "blog-01",
        category: "blog",
        description: "Blog post card with image, author and tags",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardFooter", "Avatar", "Badge", "Button"],
        template: {
            id: "blog-01-root",
            type: "Card",
            name: "Blog Post Card",
            props: { className: "w-full max-w-sm overflow-hidden" },
            children: [
                { id: "blog-01-img", type: "img", name: "img", props: { src: "https://placehold.co/400x200", alt: "Blog cover", className: "w-full h-48 object-cover" }, children: [] },
                {
                    id: "blog-01-header",
                    type: "CardHeader",
                    name: "CardHeader",
                    props: { className: "pb-2" },
                    children: [
                        divContainer("blog-01-badges", "flex gap-2 mb-2", [
                            { id: "blog-01-badge-1", type: "Badge", name: "Badge", props: {}, children: [textSpan("b01-cat", "Technology")] },
                            { id: "blog-01-badge-2", type: "Badge", name: "Badge", props: { variant: "outline" }, children: [textSpan("b01-tag", "5 min read")] },
                        ]),
                        { id: "blog-01-title", type: "h3", name: "h3", props: { className: "text-xl font-semibold leading-tight" }, children: "The Future of Web Development in 2025" },
                    ],
                },
                {
                    id: "blog-01-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "pb-2" },
                    children: [
                        { id: "blog-01-excerpt", type: "p", name: "p", props: { className: "text-sm text-muted-foreground line-clamp-3" }, children: "Exploring the emerging trends in web development, from AI-assisted coding to the rise of edge computing and WebAssembly." },
                    ],
                },
                {
                    id: "blog-01-footer",
                    type: "CardFooter",
                    name: "CardFooter",
                    props: { className: "flex items-center justify-between pt-0" },
                    children: [
                        divContainer("blog-01-author", "flex items-center gap-2", [
                            {
                                id: "blog-01-author-avatar",
                                type: "Avatar",
                                name: "Avatar",
                                props: { className: "h-7 w-7" },
                                children: [
                                    { id: "blog-01-avatar-img", type: "AvatarImage", name: "AvatarImage", props: { src: "https://placehold.co/32x32", alt: "Author" }, children: [] },
                                    { id: "blog-01-avatar-fallback", type: "AvatarFallback", name: "AvatarFallback", props: { className: "text-xs" }, children: "JD" },
                                ],
                            },
                            divContainer("blog-01-author-info", "flex flex-col", [
                                { id: "blog-01-author-name", type: "span", name: "span", props: { className: "text-xs font-medium" }, children: "Jane Doe" },
                                { id: "blog-01-date", type: "span", name: "span", props: { className: "text-xs text-muted-foreground" }, children: "Jan 15, 2025" },
                            ]),
                        ]),
                        { id: "blog-01-read-btn", type: "Button", name: "Button", props: { variant: "ghost", size: "sm" }, children: [textSpan("b01-read", "Read more")] },
                    ],
                },
            ],
        },
    },
    {
        name: "blog-02",
        category: "blog",
        description: "Blog post list item (horizontal layout)",
        requiredComponents: ["Card", "CardContent", "Avatar", "Badge"],
        template: divContainer("blog-02-root", "space-y-4 w-full max-w-2xl", [
            {
                id: "blog-02-item-1",
                type: "Card",
                name: "Blog List Item",
                props: { className: "overflow-hidden" },
                children: [
                    {
                        id: "blog-02-item-1-content",
                        type: "CardContent",
                        name: "CardContent",
                        props: { className: "p-4 flex gap-4 items-start" },
                        children: [
                            { id: "blog-02-img-1", type: "img", name: "img", props: { src: "https://placehold.co/120x80", alt: "Blog thumbnail", className: "rounded-md w-28 h-20 object-cover flex-shrink-0" }, children: [] },
                            divContainer("blog-02-info-1", "flex-1 min-w-0 space-y-1", [
                                { id: "blog-02-badge-1", type: "Badge", name: "Badge", props: { variant: "outline", className: "text-xs" }, children: [textSpan("b02-cat-1", "Design")] },
                                { id: "blog-02-title-1", type: "h4", name: "h4", props: { className: "font-semibold leading-snug line-clamp-2" }, children: "Design Systems at Scale: Lessons Learned" },
                                { id: "blog-02-meta-1", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "Alice Kim · Jan 12, 2025 · 8 min read" },
                            ]),
                        ],
                    },
                ],
            },
            {
                id: "blog-02-item-2",
                type: "Card",
                name: "Blog List Item",
                props: { className: "overflow-hidden" },
                children: [
                    {
                        id: "blog-02-item-2-content",
                        type: "CardContent",
                        name: "CardContent",
                        props: { className: "p-4 flex gap-4 items-start" },
                        children: [
                            { id: "blog-02-img-2", type: "img", name: "img", props: { src: "https://placehold.co/120x80", alt: "Blog thumbnail", className: "rounded-md w-28 h-20 object-cover flex-shrink-0" }, children: [] },
                            divContainer("blog-02-info-2", "flex-1 min-w-0 space-y-1", [
                                { id: "blog-02-badge-2", type: "Badge", name: "Badge", props: { variant: "outline", className: "text-xs" }, children: [textSpan("b02-cat-2", "Engineering")] },
                                { id: "blog-02-title-2", type: "h4", name: "h4", props: { className: "font-semibold leading-snug line-clamp-2" }, children: "Building Resilient Microservices with Next.js" },
                                { id: "blog-02-meta-2", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "Bob Lee · Jan 10, 2025 · 12 min read" },
                            ]),
                        ],
                    },
                ],
            },
        ]),
    },
    {
        name: "blog-03",
        category: "blog",
        description: "Featured blog hero with author",
        requiredComponents: ["Card", "CardContent", "Avatar", "Badge", "Button"],
        template: {
            id: "blog-03-root",
            type: "Card",
            name: "Featured Blog Hero",
            props: { className: "w-full max-w-3xl overflow-hidden" },
            children: [
                { id: "blog-03-img", type: "img", name: "img", props: { src: "https://placehold.co/800x400", alt: "Featured cover", className: "w-full h-64 object-cover" }, children: [] },
                {
                    id: "blog-03-content",
                    type: "CardContent",
                    name: "CardContent",
                    props: { className: "p-6 space-y-4" },
                    children: [
                        divContainer("blog-03-meta", "flex items-center gap-2", [
                            { id: "blog-03-badge", type: "Badge", name: "Badge", props: {}, children: [textSpan("b03-badge", "Featured")] },
                            { id: "blog-03-date", type: "span", name: "span", props: { className: "text-sm text-muted-foreground" }, children: "January 15, 2025" },
                        ]),
                        { id: "blog-03-title", type: "h2", name: "h2", props: { className: "text-3xl font-bold leading-tight" }, children: "The Complete Guide to Modern React Patterns" },
                        { id: "blog-03-excerpt", type: "p", name: "p", props: { className: "text-muted-foreground leading-relaxed" }, children: "Discover how leading teams are leveraging React Server Components, Suspense, and concurrent features to build faster, more maintainable applications." },
                        divContainer("blog-03-footer", "flex items-center justify-between pt-2", [
                            divContainer("blog-03-author", "flex items-center gap-3", [
                                {
                                    id: "blog-03-avatar",
                                    type: "Avatar",
                                    name: "Avatar",
                                    props: { className: "h-10 w-10" },
                                    children: [
                                        { id: "blog-03-avatar-img", type: "AvatarImage", name: "AvatarImage", props: { src: "https://placehold.co/40x40", alt: "Author" }, children: [] },
                                        { id: "blog-03-avatar-fallback", type: "AvatarFallback", name: "AvatarFallback", props: {}, children: "SK" },
                                    ],
                                },
                                divContainer("blog-03-author-info", "space-y-0.5", [
                                    { id: "blog-03-author-name", type: "p", name: "p", props: { className: "text-sm font-semibold" }, children: "Sarah Kim" },
                                    { id: "blog-03-author-role", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "Senior React Engineer" },
                                ]),
                            ]),
                            { id: "blog-03-read-btn", type: "Button", name: "Button", props: {}, children: [textSpan("b03-btn", "Read Article")] },
                        ]),
                    ],
                },
            ],
        },
    },
];

// ============================================
// LANDING PAGE BLOCKS
// ============================================
const landingBlocks: BlockDefinition[] = [
    {
        name: "landing-hero-01",
        category: "landing",
        description: "Hero section with headline and CTA",
        requiredComponents: ["Button", "Badge"],
        template: divContainer("landing-hero-01-root", "flex flex-col items-center justify-center text-center py-24 px-4 space-y-6 bg-gradient-to-b from-background to-muted/20 rounded-xl", [
            { id: "landing-hero-01-badge", type: "Badge", name: "Badge", props: { variant: "outline", className: "px-4 py-1 rounded-full" }, children: [textSpan("lh01-badge", "✨ New Release — v2.0")] },
            divContainer("landing-hero-01-headline", "space-y-4 max-w-3xl", [
                { id: "landing-hero-01-h1", type: "h1", name: "h1", props: { className: "text-5xl md:text-6xl font-bold tracking-tight" }, children: "Build faster with modern components" },
                { id: "landing-hero-01-sub", type: "p", name: "p", props: { className: "text-xl text-muted-foreground max-w-2xl mx-auto" }, children: "A comprehensive UI kit for building stunning web applications. Ship in hours, not weeks." },
            ]),
            divContainer("landing-hero-01-ctas", "flex gap-4 flex-wrap justify-center", [
                { id: "landing-hero-01-cta-primary", type: "Button", name: "Button", props: { size: "lg", className: "px-8" }, children: [textSpan("lh01-cta1", "Get Started Free")] },
                { id: "landing-hero-01-cta-secondary", type: "Button", name: "Button", props: { variant: "outline", size: "lg", className: "px-8" }, children: [textSpan("lh01-cta2", "View Demo")] },
            ]),
            { id: "landing-hero-01-note", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "No credit card required · Free plan available · Cancel anytime" },
        ]),
    },
    {
        name: "landing-features-01",
        category: "landing",
        description: "Features grid with icons and descriptions",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardTitle", "CardDescription"],
        template: divContainer("landing-features-01-root", "space-y-8 py-16 px-4", [
            divContainer("landing-features-01-header", "text-center space-y-2 max-w-2xl mx-auto", [
                { id: "landing-feat-title", type: "h2", name: "h2", props: { className: "text-3xl font-bold" }, children: "Everything you need" },
                { id: "landing-feat-sub", type: "p", name: "p", props: { className: "text-muted-foreground" }, children: "Powerful features to help your team build better products faster." },
            ]),
            divContainer("landing-features-01-grid", "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto", [
                {
                    id: "landing-feat-card-1", type: "Card", name: "Card", props: {},
                    children: [
                        { id: "landing-feat-card-1-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                            { id: "lf-icon-1", type: "div", name: "div", props: { className: "text-3xl mb-2" }, children: "⚡" },
                            { id: "lf-title-1", type: "CardTitle", name: "CardTitle", props: { className: "text-lg" }, children: [textSpan("lf-t1", "Blazing Fast")] },
                        ]},
                        { id: "landing-feat-card-1-content", type: "CardContent", name: "CardContent", props: {}, children: [
                            { id: "lf-desc-1", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("lf-d1", "Optimized for performance from the ground up. Sub-second load times guaranteed.")] },
                        ]},
                    ],
                },
                {
                    id: "landing-feat-card-2", type: "Card", name: "Card", props: {},
                    children: [
                        { id: "landing-feat-card-2-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                            { id: "lf-icon-2", type: "div", name: "div", props: { className: "text-3xl mb-2" }, children: "🎨" },
                            { id: "lf-title-2", type: "CardTitle", name: "CardTitle", props: { className: "text-lg" }, children: [textSpan("lf-t2", "Fully Customizable")] },
                        ]},
                        { id: "landing-feat-card-2-content", type: "CardContent", name: "CardContent", props: {}, children: [
                            { id: "lf-desc-2", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("lf-d2", "Tailor every component to match your brand with our flexible design system.")] },
                        ]},
                    ],
                },
                {
                    id: "landing-feat-card-3", type: "Card", name: "Card", props: {},
                    children: [
                        { id: "landing-feat-card-3-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                            { id: "lf-icon-3", type: "div", name: "div", props: { className: "text-3xl mb-2" }, children: "🔒" },
                            { id: "lf-title-3", type: "CardTitle", name: "CardTitle", props: { className: "text-lg" }, children: [textSpan("lf-t3", "Enterprise Security")] },
                        ]},
                        { id: "landing-feat-card-3-content", type: "CardContent", name: "CardContent", props: {}, children: [
                            { id: "lf-desc-3", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("lf-d3", "SOC 2 compliant with end-to-end encryption and granular access controls.")] },
                        ]},
                    ],
                },
                {
                    id: "landing-feat-card-4", type: "Card", name: "Card", props: {},
                    children: [
                        { id: "landing-feat-card-4-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                            { id: "lf-icon-4", type: "div", name: "div", props: { className: "text-3xl mb-2" }, children: "📊" },
                            { id: "lf-title-4", type: "CardTitle", name: "CardTitle", props: { className: "text-lg" }, children: [textSpan("lf-t4", "Rich Analytics")] },
                        ]},
                        { id: "landing-feat-card-4-content", type: "CardContent", name: "CardContent", props: {}, children: [
                            { id: "lf-desc-4", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("lf-d4", "Gain deep insights with real-time dashboards and custom reporting tools.")] },
                        ]},
                    ],
                },
                {
                    id: "landing-feat-card-5", type: "Card", name: "Card", props: {},
                    children: [
                        { id: "landing-feat-card-5-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                            { id: "lf-icon-5", type: "div", name: "div", props: { className: "text-3xl mb-2" }, children: "🤝" },
                            { id: "lf-title-5", type: "CardTitle", name: "CardTitle", props: { className: "text-lg" }, children: [textSpan("lf-t5", "Team Collaboration")] },
                        ]},
                        { id: "landing-feat-card-5-content", type: "CardContent", name: "CardContent", props: {}, children: [
                            { id: "lf-desc-5", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("lf-d5", "Invite your team, assign roles, and collaborate seamlessly in real time.")] },
                        ]},
                    ],
                },
                {
                    id: "landing-feat-card-6", type: "Card", name: "Card", props: {},
                    children: [
                        { id: "landing-feat-card-6-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                            { id: "lf-icon-6", type: "div", name: "div", props: { className: "text-3xl mb-2" }, children: "🔌" },
                            { id: "lf-title-6", type: "CardTitle", name: "CardTitle", props: { className: "text-lg" }, children: [textSpan("lf-t6", "100+ Integrations")] },
                        ]},
                        { id: "landing-feat-card-6-content", type: "CardContent", name: "CardContent", props: {}, children: [
                            { id: "lf-desc-6", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("lf-d6", "Connect with all your favorite tools: Slack, GitHub, Jira, Figma, and more.")] },
                        ]},
                    ],
                },
            ]),
        ]),
    },
    {
        name: "landing-cta-01",
        category: "landing",
        description: "CTA section with email signup",
        requiredComponents: ["Button", "Input"],
        template: divContainer("landing-cta-01-root", "bg-primary text-primary-foreground rounded-2xl py-16 px-8 text-center space-y-6 max-w-3xl mx-auto", [
            { id: "landing-cta-01-h2", type: "h2", name: "h2", props: { className: "text-3xl font-bold" }, children: "Ready to get started?" },
            { id: "landing-cta-01-sub", type: "p", name: "p", props: { className: "text-primary-foreground/80 max-w-lg mx-auto" }, children: "Join thousands of teams already using our platform to ship faster and build better products." },
            divContainer("landing-cta-01-form", "flex gap-2 max-w-sm mx-auto", [
                { id: "landing-cta-01-input", type: "Input", name: "Input", props: { type: "email", placeholder: "Enter your email", className: "bg-background text-foreground" }, children: [] },
                { id: "landing-cta-01-btn", type: "Button", name: "Button", props: { variant: "secondary" }, children: [textSpan("lc01-btn", "Get Started")] },
            ]),
        ]),
    },
];

// ============================================
// PRICING BLOCKS
// ============================================
const pricingBlocks: BlockDefinition[] = [
    {
        name: "pricing-01",
        category: "pricing",
        description: "Three-tier pricing cards",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardFooter", "CardTitle", "CardDescription", "Button", "Badge", "Separator"],
        template: divContainer("pricing-01-root", "grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto py-8", [
            {
                id: "pricing-01-starter",
                type: "Card",
                name: "Starter Plan",
                props: { className: "flex flex-col" },
                children: [
                    { id: "pricing-01-starter-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                        { id: "pricing-01-starter-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("p01-starter-t", "Starter")] },
                        { id: "pricing-01-starter-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("p01-starter-d", "Perfect for individuals and small projects")] },
                        divContainer("pricing-01-starter-price", "mt-4 flex items-baseline gap-1", [
                            { id: "pricing-01-starter-amount", type: "span", name: "span", props: { className: "text-4xl font-bold" }, children: "$0" },
                            { id: "pricing-01-starter-period", type: "span", name: "span", props: { className: "text-muted-foreground" }, children: "/month" },
                        ]),
                    ]},
                    { id: "pricing-01-starter-content", type: "CardContent", name: "CardContent", props: { className: "flex-1 space-y-2" }, children: [
                        divContainer("p01-f1", "flex items-center gap-2 text-sm", [textSpan("p01-f1-text", "✓  5 Projects"), ]),
                        divContainer("p01-f2", "flex items-center gap-2 text-sm", [textSpan("p01-f2-text", "✓  10 GB Storage"), ]),
                        divContainer("p01-f3", "flex items-center gap-2 text-sm", [textSpan("p01-f3-text", "✓  Community support"), ]),
                        divContainer("p01-f4", "flex items-center gap-2 text-sm text-muted-foreground", [textSpan("p01-f4-text", "✗  Custom domains"), ]),
                        divContainer("p01-f5", "flex items-center gap-2 text-sm text-muted-foreground", [textSpan("p01-f5-text", "✗  Analytics"), ]),
                    ]},
                    { id: "pricing-01-starter-footer", type: "CardFooter", name: "CardFooter", props: {}, children: [
                        { id: "pricing-01-starter-btn", type: "Button", name: "Button", props: { variant: "outline", className: "w-full" }, children: [textSpan("p01-starter-btn", "Get Started Free")] },
                    ]},
                ],
            },
            {
                id: "pricing-01-pro",
                type: "Card",
                name: "Pro Plan",
                props: { className: "flex flex-col border-primary relative" },
                children: [
                    divContainer("pricing-01-pro-badge", "absolute -top-3 left-1/2 -translate-x-1/2", [
                        { id: "pricing-01-pro-popular", type: "Badge", name: "Badge", props: { className: "px-4" }, children: [textSpan("p01-popular", "Most Popular")] },
                    ]),
                    { id: "pricing-01-pro-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                        { id: "pricing-01-pro-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("p01-pro-t", "Pro")] },
                        { id: "pricing-01-pro-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("p01-pro-d", "Great for growing teams and businesses")] },
                        divContainer("pricing-01-pro-price", "mt-4 flex items-baseline gap-1", [
                            { id: "pricing-01-pro-amount", type: "span", name: "span", props: { className: "text-4xl font-bold" }, children: "$29" },
                            { id: "pricing-01-pro-period", type: "span", name: "span", props: { className: "text-muted-foreground" }, children: "/month" },
                        ]),
                    ]},
                    { id: "pricing-01-pro-content", type: "CardContent", name: "CardContent", props: { className: "flex-1 space-y-2" }, children: [
                        divContainer("p01-pf1", "flex items-center gap-2 text-sm", [textSpan("p01-pf1-text", "✓  Unlimited Projects"), ]),
                        divContainer("p01-pf2", "flex items-center gap-2 text-sm", [textSpan("p01-pf2-text", "✓  100 GB Storage"), ]),
                        divContainer("p01-pf3", "flex items-center gap-2 text-sm", [textSpan("p01-pf3-text", "✓  Priority support"), ]),
                        divContainer("p01-pf4", "flex items-center gap-2 text-sm", [textSpan("p01-pf4-text", "✓  Custom domains"), ]),
                        divContainer("p01-pf5", "flex items-center gap-2 text-sm", [textSpan("p01-pf5-text", "✓  Advanced analytics"), ]),
                    ]},
                    { id: "pricing-01-pro-footer", type: "CardFooter", name: "CardFooter", props: {}, children: [
                        { id: "pricing-01-pro-btn", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("p01-pro-btn", "Start Pro Trial")] },
                    ]},
                ],
            },
            {
                id: "pricing-01-enterprise",
                type: "Card",
                name: "Enterprise Plan",
                props: { className: "flex flex-col" },
                children: [
                    { id: "pricing-01-ent-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                        { id: "pricing-01-ent-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("p01-ent-t", "Enterprise")] },
                        { id: "pricing-01-ent-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("p01-ent-d", "Custom solutions for large organizations")] },
                        divContainer("pricing-01-ent-price", "mt-4 flex items-baseline gap-1", [
                            { id: "pricing-01-ent-amount", type: "span", name: "span", props: { className: "text-4xl font-bold" }, children: "Custom" },
                        ]),
                    ]},
                    { id: "pricing-01-ent-content", type: "CardContent", name: "CardContent", props: { className: "flex-1 space-y-2" }, children: [
                        divContainer("p01-ef1", "flex items-center gap-2 text-sm", [textSpan("p01-ef1-text", "✓  Everything in Pro"), ]),
                        divContainer("p01-ef2", "flex items-center gap-2 text-sm", [textSpan("p01-ef2-text", "✓  Unlimited Storage"), ]),
                        divContainer("p01-ef3", "flex items-center gap-2 text-sm", [textSpan("p01-ef3-text", "✓  Dedicated support"), ]),
                        divContainer("p01-ef4", "flex items-center gap-2 text-sm", [textSpan("p01-ef4-text", "✓  SLA guarantee"), ]),
                        divContainer("p01-ef5", "flex items-center gap-2 text-sm", [textSpan("p01-ef5-text", "✓  Custom contracts"), ]),
                    ]},
                    { id: "pricing-01-ent-footer", type: "CardFooter", name: "CardFooter", props: {}, children: [
                        { id: "pricing-01-ent-btn", type: "Button", name: "Button", props: { variant: "outline", className: "w-full" }, children: [textSpan("p01-ent-btn", "Contact Sales")] },
                    ]},
                ],
            },
        ]),
    },
    {
        name: "pricing-02",
        category: "pricing",
        description: "Simple single-column pricing with features list",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardFooter", "Button", "Separator"],
        template: {
            id: "pricing-02-root",
            type: "Card",
            name: "Simple Pricing",
            props: { className: "w-full max-w-sm mx-auto" },
            children: [
                { id: "pricing-02-header", type: "CardHeader", name: "CardHeader", props: { className: "text-center pb-2" }, children: [
                    { id: "pricing-02-name", type: "p", name: "p", props: { className: "text-sm font-medium text-muted-foreground uppercase tracking-wide" }, children: "Pro Plan" },
                    divContainer("pricing-02-price", "mt-2 flex items-baseline justify-center gap-1", [
                        { id: "pricing-02-currency", type: "span", name: "span", props: { className: "text-2xl font-semibold" }, children: "$" },
                        { id: "pricing-02-amount", type: "span", name: "span", props: { className: "text-6xl font-bold" }, children: "49" },
                        { id: "pricing-02-period", type: "span", name: "span", props: { className: "text-muted-foreground" }, children: "/mo" },
                    ]),
                ]},
                { id: "pricing-02-content", type: "CardContent", name: "CardContent", props: { className: "space-y-3" }, children: [
                    { id: "pricing-02-sep", type: "Separator", name: "Separator", props: {}, children: [] },
                    divContainer("p02-f1", "flex justify-between text-sm py-1", [textSpan("p02-fl1", "Unlimited projects"), textSpan("p02-fv1", "✓")]),
                    divContainer("p02-f2", "flex justify-between text-sm py-1", [textSpan("p02-fl2", "Custom domains"), textSpan("p02-fv2", "✓")]),
                    divContainer("p02-f3", "flex justify-between text-sm py-1", [textSpan("p02-fl3", "Advanced analytics"), textSpan("p02-fv3", "✓")]),
                    divContainer("p02-f4", "flex justify-between text-sm py-1", [textSpan("p02-fl4", "Team members"), textSpan("p02-fv4", "Up to 10")]),
                    divContainer("p02-f5", "flex justify-between text-sm py-1", [textSpan("p02-fl5", "Storage"), textSpan("p02-fv5", "100 GB")]),
                    divContainer("p02-f6", "flex justify-between text-sm py-1", [textSpan("p02-fl6", "Support"), textSpan("p02-fv6", "Priority")]),
                ]},
                { id: "pricing-02-footer", type: "CardFooter", name: "CardFooter", props: {}, children: [
                    { id: "pricing-02-btn", type: "Button", name: "Button", props: { className: "w-full" }, children: [textSpan("p02-btn", "Start Free Trial")] },
                ]},
            ],
        },
    },
];

// ============================================
// SETTINGS BLOCKS
// ============================================
const settingsBlocks: BlockDefinition[] = [
    {
        name: "settings-profile-01",
        category: "settings",
        description: "Profile settings form",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardFooter", "CardTitle", "CardDescription", "Input", "Label", "Button", "Avatar", "Separator"],
        template: {
            id: "settings-profile-01-root",
            type: "Card",
            name: "Profile Settings",
            props: { className: "w-full max-w-2xl" },
            children: [
                { id: "settings-profile-01-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                    { id: "sp01-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("sp01-t", "Profile Settings")] },
                    { id: "sp01-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("sp01-d", "Update your personal information and public profile")] },
                ]},
                { id: "settings-profile-01-content", type: "CardContent", name: "CardContent", props: { className: "space-y-6" }, children: [
                    divContainer("sp01-avatar-section", "flex items-center gap-4", [
                        {
                            id: "sp01-avatar",
                            type: "Avatar",
                            name: "Avatar",
                            props: { className: "h-16 w-16" },
                            children: [
                                { id: "sp01-avatar-img", type: "AvatarImage", name: "AvatarImage", props: { src: "https://placehold.co/64x64", alt: "Profile" }, children: [] },
                                { id: "sp01-avatar-fallback", type: "AvatarFallback", name: "AvatarFallback", props: {}, children: "JD" },
                            ],
                        },
                        divContainer("sp01-avatar-actions", "space-y-1", [
                            { id: "sp01-change-avatar", type: "Button", name: "Button", props: { variant: "outline", size: "sm" }, children: [textSpan("sp01-change", "Change Photo")] },
                            { id: "sp01-avatar-hint", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "JPG, GIF or PNG. Max size 2MB." },
                        ]),
                    ]),
                    { id: "sp01-sep", type: "Separator", name: "Separator", props: {}, children: [] },
                    divContainer("sp01-form", "grid grid-cols-1 sm:grid-cols-2 gap-4", [
                        divContainer("sp01-name-group", "space-y-2", [
                            { id: "sp01-name-label", type: "Label", name: "Label", props: { htmlFor: "first-name" }, children: "First Name" },
                            { id: "sp01-name-input", type: "Input", name: "Input", props: { id: "first-name", defaultValue: "Jane" }, children: [] },
                        ]),
                        divContainer("sp01-lastname-group", "space-y-2", [
                            { id: "sp01-lastname-label", type: "Label", name: "Label", props: { htmlFor: "last-name" }, children: "Last Name" },
                            { id: "sp01-lastname-input", type: "Input", name: "Input", props: { id: "last-name", defaultValue: "Doe" }, children: [] },
                        ]),
                        divContainer("sp01-email-group", "space-y-2 col-span-full", [
                            { id: "sp01-email-label", type: "Label", name: "Label", props: { htmlFor: "email" }, children: "Email" },
                            { id: "sp01-email-input", type: "Input", name: "Input", props: { id: "email", type: "email", defaultValue: "jane@example.com" }, children: [] },
                        ]),
                        divContainer("sp01-bio-group", "space-y-2 col-span-full", [
                            { id: "sp01-bio-label", type: "Label", name: "Label", props: { htmlFor: "bio" }, children: "Bio" },
                            { id: "sp01-bio-input", type: "Input", name: "Input", props: { id: "bio", placeholder: "Tell us a bit about yourself" }, children: [] },
                        ]),
                    ]),
                ]},
                { id: "settings-profile-01-footer", type: "CardFooter", name: "CardFooter", props: { className: "justify-end gap-2" }, children: [
                    { id: "sp01-cancel", type: "Button", name: "Button", props: { variant: "outline" }, children: [textSpan("sp01-cancel-t", "Cancel")] },
                    { id: "sp01-save", type: "Button", name: "Button", props: {}, children: [textSpan("sp01-save-t", "Save Changes")] },
                ]},
            ],
        },
    },
    {
        name: "settings-notifications-01",
        category: "settings",
        description: "Notification preferences settings",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardFooter", "CardTitle", "CardDescription", "Button", "Separator"],
        template: {
            id: "settings-notif-01-root",
            type: "Card",
            name: "Notification Settings",
            props: { className: "w-full max-w-2xl" },
            children: [
                { id: "sn01-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                    { id: "sn01-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("sn01-t", "Notifications")] },
                    { id: "sn01-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("sn01-d", "Manage how you receive notifications")] },
                ]},
                { id: "sn01-content", type: "CardContent", name: "CardContent", props: { className: "space-y-4" }, children: [
                    divContainer("sn01-item-1", "flex items-center justify-between py-3", [
                        divContainer("sn01-item-1-info", "space-y-0.5", [
                            { id: "sn01-item-1-title", type: "p", name: "p", props: { className: "text-sm font-medium" }, children: "Email Notifications" },
                            { id: "sn01-item-1-desc", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "Receive email updates about your account" },
                        ]),
                        { id: "sn01-toggle-1", type: "Button", name: "Button", props: { variant: "outline", size: "sm" }, children: [textSpan("sn01-t1", "Enabled")] },
                    ]),
                    { id: "sn01-sep-1", type: "Separator", name: "Separator", props: {}, children: [] },
                    divContainer("sn01-item-2", "flex items-center justify-between py-3", [
                        divContainer("sn01-item-2-info", "space-y-0.5", [
                            { id: "sn01-item-2-title", type: "p", name: "p", props: { className: "text-sm font-medium" }, children: "Push Notifications" },
                            { id: "sn01-item-2-desc", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "Get push notifications in your browser" },
                        ]),
                        { id: "sn01-toggle-2", type: "Button", name: "Button", props: { variant: "outline", size: "sm" }, children: [textSpan("sn01-t2", "Disabled")] },
                    ]),
                    { id: "sn01-sep-2", type: "Separator", name: "Separator", props: {}, children: [] },
                    divContainer("sn01-item-3", "flex items-center justify-between py-3", [
                        divContainer("sn01-item-3-info", "space-y-0.5", [
                            { id: "sn01-item-3-title", type: "p", name: "p", props: { className: "text-sm font-medium" }, children: "Marketing Emails" },
                            { id: "sn01-item-3-desc", type: "p", name: "p", props: { className: "text-xs text-muted-foreground" }, children: "Receive product updates and newsletters" },
                        ]),
                        { id: "sn01-toggle-3", type: "Button", name: "Button", props: { variant: "outline", size: "sm" }, children: [textSpan("sn01-t3", "Enabled")] },
                    ]),
                ]},
                { id: "sn01-footer", type: "CardFooter", name: "CardFooter", props: { className: "justify-end" }, children: [
                    { id: "sn01-save", type: "Button", name: "Button", props: {}, children: [textSpan("sn01-save-t", "Save Preferences")] },
                ]},
            ],
        },
    },
    {
        name: "settings-account-01",
        category: "settings",
        description: "Account and security settings with danger zone",
        requiredComponents: ["Card", "CardHeader", "CardContent", "CardFooter", "CardTitle", "CardDescription", "Input", "Label", "Button", "Separator"],
        template: divContainer("settings-account-01-root", "w-full max-w-2xl space-y-6", [
            {
                id: "sa01-password-card",
                type: "Card",
                name: "Change Password",
                props: {},
                children: [
                    { id: "sa01-pw-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                        { id: "sa01-pw-title", type: "CardTitle", name: "CardTitle", props: {}, children: [textSpan("sa01-pw-t", "Change Password")] },
                        { id: "sa01-pw-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("sa01-pw-d", "Update your password to keep your account secure")] },
                    ]},
                    { id: "sa01-pw-content", type: "CardContent", name: "CardContent", props: { className: "space-y-4" }, children: [
                        divContainer("sa01-curr-pw-group", "space-y-2", [
                            { id: "sa01-curr-pw-label", type: "Label", name: "Label", props: { htmlFor: "current-password" }, children: "Current Password" },
                            { id: "sa01-curr-pw-input", type: "Input", name: "Input", props: { id: "current-password", type: "password" }, children: [] },
                        ]),
                        divContainer("sa01-new-pw-group", "space-y-2", [
                            { id: "sa01-new-pw-label", type: "Label", name: "Label", props: { htmlFor: "new-password" }, children: "New Password" },
                            { id: "sa01-new-pw-input", type: "Input", name: "Input", props: { id: "new-password", type: "password" }, children: [] },
                        ]),
                        divContainer("sa01-confirm-pw-group", "space-y-2", [
                            { id: "sa01-confirm-pw-label", type: "Label", name: "Label", props: { htmlFor: "confirm-password" }, children: "Confirm New Password" },
                            { id: "sa01-confirm-pw-input", type: "Input", name: "Input", props: { id: "confirm-password", type: "password" }, children: [] },
                        ]),
                    ]},
                    { id: "sa01-pw-footer", type: "CardFooter", name: "CardFooter", props: { className: "justify-end" }, children: [
                        { id: "sa01-pw-save", type: "Button", name: "Button", props: {}, children: [textSpan("sa01-pw-btn", "Update Password")] },
                    ]},
                ],
            },
            {
                id: "sa01-danger-card",
                type: "Card",
                name: "Danger Zone",
                props: { className: "border-destructive" },
                children: [
                    { id: "sa01-danger-header", type: "CardHeader", name: "CardHeader", props: {}, children: [
                        { id: "sa01-danger-title", type: "CardTitle", name: "CardTitle", props: { className: "text-destructive" }, children: [textSpan("sa01-dt", "Danger Zone")] },
                        { id: "sa01-danger-desc", type: "CardDescription", name: "CardDescription", props: {}, children: [textSpan("sa01-dd", "These actions are permanent and cannot be undone")] },
                    ]},
                    { id: "sa01-danger-content", type: "CardContent", name: "CardContent", props: {}, children: [
                        { id: "sa01-delete-btn", type: "Button", name: "Button", props: { variant: "destructive" }, children: [textSpan("sa01-delete-t", "Delete Account")] },
                    ]},
                ],
            },
        ]),
    },
];

// ============================================
// ERROR PAGE BLOCKS
// ============================================
const errorPageBlocks: BlockDefinition[] = [
    {
        name: "error-404-01",
        category: "error",
        description: "404 Not Found page",
        requiredComponents: ["Button"],
        template: divContainer("error-404-01-root", "flex flex-col items-center justify-center min-h-[400px] text-center px-4 space-y-6", [
            { id: "error-404-01-code", type: "div", name: "div", props: { className: "text-9xl font-black text-muted-foreground/20 select-none leading-none" }, children: "404" },
            divContainer("error-404-01-text", "space-y-2 -mt-4", [
                { id: "error-404-01-title", type: "h1", name: "h1", props: { className: "text-3xl font-bold" }, children: "Page not found" },
                { id: "error-404-01-desc", type: "p", name: "p", props: { className: "text-muted-foreground max-w-sm" }, children: "Oops! The page you're looking for doesn't exist or has been moved." },
            ]),
            divContainer("error-404-01-actions", "flex gap-3", [
                { id: "error-404-01-home", type: "Button", name: "Button", props: {}, children: [textSpan("e404-home", "Go Home")] },
                { id: "error-404-01-back", type: "Button", name: "Button", props: { variant: "outline" }, children: [textSpan("e404-back", "Go Back")] },
            ]),
        ]),
    },
    {
        name: "error-500-01",
        category: "error",
        description: "500 Internal Server Error page",
        requiredComponents: ["Button"],
        template: divContainer("error-500-01-root", "flex flex-col items-center justify-center min-h-[400px] text-center px-4 space-y-6", [
            { id: "error-500-01-icon", type: "div", name: "div", props: { className: "text-7xl" }, children: "⚠️" },
            divContainer("error-500-01-text", "space-y-2", [
                { id: "error-500-01-code", type: "p", name: "p", props: { className: "text-sm font-medium text-muted-foreground uppercase tracking-wide" }, children: "Error 500" },
                { id: "error-500-01-title", type: "h1", name: "h1", props: { className: "text-3xl font-bold" }, children: "Internal Server Error" },
                { id: "error-500-01-desc", type: "p", name: "p", props: { className: "text-muted-foreground max-w-sm" }, children: "Something went wrong on our end. We're working to fix it. Please try again in a few moments." },
            ]),
            divContainer("error-500-01-actions", "flex gap-3", [
                { id: "error-500-01-retry", type: "Button", name: "Button", props: {}, children: [textSpan("e500-retry", "Try Again")] },
                { id: "error-500-01-home", type: "Button", name: "Button", props: { variant: "outline" }, children: [textSpan("e500-home", "Go Home")] },
            ]),
        ]),
    },
    {
        name: "error-maintenance-01",
        category: "error",
        description: "Maintenance page",
        requiredComponents: ["Card", "CardContent", "Button"],
        template: divContainer("error-maint-01-root", "flex flex-col items-center justify-center min-h-[400px] text-center px-4 space-y-6", [
            { id: "error-maint-01-icon", type: "div", name: "div", props: { className: "text-7xl" }, children: "🔧" },
            divContainer("error-maint-01-text", "space-y-2", [
                { id: "error-maint-01-title", type: "h1", name: "h1", props: { className: "text-3xl font-bold" }, children: "Under Maintenance" },
                { id: "error-maint-01-desc", type: "p", name: "p", props: { className: "text-muted-foreground max-w-sm" }, children: "We're currently performing scheduled maintenance. We'll be back online shortly. Thank you for your patience." },
                { id: "error-maint-01-time", type: "p", name: "p", props: { className: "text-sm font-medium" }, children: "Expected return: Today at 6:00 PM UTC" },
            ]),
            { id: "error-maint-01-notify", type: "Button", name: "Button", props: { variant: "outline" }, children: [textSpan("emaint-notify", "Notify Me When Back")] },
        ]),
    },
    {
        name: "error-403-01",
        category: "error",
        description: "403 Forbidden / Unauthorized page",
        requiredComponents: ["Button"],
        template: divContainer("error-403-01-root", "flex flex-col items-center justify-center min-h-[400px] text-center px-4 space-y-6", [
            { id: "error-403-01-icon", type: "div", name: "div", props: { className: "text-7xl" }, children: "🔒" },
            divContainer("error-403-01-text", "space-y-2", [
                { id: "error-403-01-code", type: "p", name: "p", props: { className: "text-sm font-medium text-muted-foreground uppercase tracking-wide" }, children: "Error 403" },
                { id: "error-403-01-title", type: "h1", name: "h1", props: { className: "text-3xl font-bold" }, children: "Access Denied" },
                { id: "error-403-01-desc", type: "p", name: "p", props: { className: "text-muted-foreground max-w-sm" }, children: "You don't have permission to access this page. Contact your administrator if you think this is a mistake." },
            ]),
            divContainer("error-403-01-actions", "flex gap-3", [
                { id: "error-403-01-home", type: "Button", name: "Button", props: {}, children: [textSpan("e403-home", "Go Home")] },
                { id: "error-403-01-contact", type: "Button", name: "Button", props: { variant: "outline" }, children: [textSpan("e403-contact", "Contact Support")] },
            ]),
        ]),
    },
];

// ============================================
// COMBINE ALL BLOCKS
// ============================================
const allBlocks: BlockDefinition[] = [
    ...loginBlocks,
    ...sidebarBlocks,
    ...dashboardBlocks,
    ...calendarBlocks,
    ...chartAreaBlocks,
    ...chartBarBlocks,
    ...chartLineBlocks,
    ...chartPieBlocks,
    ...chartRadarBlocks,
    ...chartRadialBlocks,
    ...chartTooltipBlocks,
    ...profileBlocks,
    ...blogBlocks,
    ...landingBlocks,
    ...pricingBlocks,
    ...settingsBlocks,
    ...errorPageBlocks,
];

/**
 * Block definitions registry - all available blocks indexed by name
 */
export const blockDefinitions: BlockRegistry = allBlocks.reduce((acc, block) => {
    acc[block.name] = block;
    return acc;
}, {} as BlockRegistry);

/**
 * Get blocks by category
 */
export function getBlocksByCategory(category: string): BlockDefinition[] {
    return allBlocks.filter(block => block.category === category);
}

/**
 * Get all unique block categories
 */
export function getBlockCategories(): string[] {
    return Array.from(new Set(allBlocks.map(block => block.category)));
}

/**
 * Get all blocks as an array
 */
export function getAllBlocks(): BlockDefinition[] {
    return allBlocks;
}
