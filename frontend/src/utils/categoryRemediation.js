export const CATEGORY_EXAMPLES = {
  General: {
    context: "website visitors",
    form: "a contact form",
    action: "a navigation button",
    image: "an informative image",
  },
  Fintech: {
    context: "customers managing financial transactions",
    form: "a payment form",
    action: "a transfer confirmation button",
    image: "a transaction status illustration",
  },
  Gaming: {
    context: "players navigating a game platform",
    form: "an account registration form",
    action: "a start game button",
    image: "a game achievement illustration",
  },
  "E-commerce": {
    context: "customers purchasing products",
    form: "a checkout form",
    action: "an add to cart button",
    image: "a product photograph",
  },
  Education: {
    context: "students and instructors",
    form: "a course enrollment form",
    action: "a submit assignment button",
    image: "an educational diagram",
  },
  Healthcare: {
    context: "patients and healthcare staff",
    form: "an appointment booking form",
    action: "a confirm appointment button",
    image: "a medical information illustration",
  },
  Government: {
    context: "citizens using public services",
    form: "a public service application form",
    action: "a submit application button",
    image: "a public information graphic",
  },
};

export function getCategoryRemediation(rule, category = "General") {
  const examples = CATEGORY_EXAMPLES[category] || CATEGORY_EXAMPLES.General;

  const ruleId = String(rule || "").toLowerCase();

  if (ruleId === "image-alt") {
    return `For ${examples.image}, provide alternative text that communicates its relevant purpose. Use empty alternative text only when the image is decorative.`;
  }

  if (ruleId === "label") {
    return `Ensure every control in ${examples.form} has a programmatically associated, descriptive label.`;
  }

  if (ruleId === "button-name") {
    return `Give ${examples.action} an accessible name that clearly communicates its action.`;
  }

  if (ruleId === "color-contrast") {
    return `Ensure text and controls used by ${examples.context} meet applicable WCAG contrast requirements.`;
  }

  if (ruleId === "link-name") {
    return `Give links used by ${examples.context} meaningful accessible names that describe their destinations or actions.`;
  }

  if (ruleId === "html-has-lang") {
    return "Declare the document language using the lang attribute on the html element.";
  }

  return `Consider the needs of ${examples.context} when choosing examples and implementing a fix. Follow the original axe-core guidance and applicable WCAG requirements.`;
}

export function personalizeFixExplanation(fix, category) {
  return {
    ...fix,
    category,
    categoryExample: getCategoryRemediation(
      fix?.rule || fix?.ruleId || fix?.issue?.rule,
      category,
    ),
  };
}
