export const getDefaultProperties = (type: string) => {
  switch (type) {
    case "header":
      return {
        logoUrl: "https://example.com/logo.png",
        navLinks: [
          { text: "Home", url: "/" },
          { text: "About", url: "/about" },
          { text: "Contact", url: "/contact" },
        ],
        backgroundColor: "#333333",
        textColor: "#ffffff",
        fontSize: "16px",
        fontWeight: "normal",
        height: "100px",
        width: "100%",
      };
    case "navbar":
      return {
        menuItems: [
          { text: "Home", url: "/" },
          { text: "About", url: "/about" },
          { text: "Contact", url: "/contact" },
        ],
        backgroundColor: "#333333",
        textColor: "#ffffff",
        fontSize: "16px",
        fontWeight: "normal",
        height: "100px",
        width: "100%",
      };
    case "jumbotron":
      return {
        heading: "Welcome to My Website",
        subtext: "This is a sample jumbotron.",
        buttonText: "Learn More",
        buttonUrl: "/learn-more",
        backgroundColor: "#444444",
        textColor: "#ffffff",
        fontSize: "18px",
        fontWeight: "bold",
        height: "100px",
        width: "100%",
      };
    case "text":
      return {
        content: "Sample Text",
        textColor: "#000000",
        fontSize: "16px",
        fontWeight: "normal",
        height: "100px",
        width: "100%",
      };
    case "heading":
      return {
        content: "Section Heading",
        level: "h2",
        textColor: "#000000",
        fontSize: "24px",
        fontWeight: "bold",
        textAlign: "left",
        height: "100px",
        width: "100%",
      };
    case "button":
      return {
        text: "Click Me",
        linkTo: "", // Page to link to
        backgroundColor: "#007bff",
        textColor: "#ffffff",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        height: "100px",
        width: "100%",
      };
    case "image":
      return {
        imageUrl: "https://example.com/image.jpg",
        linkTo: "", // Page to link to
        altText: "Image description",
        objectFit: "cover",
        height: "100px",
        width: "100%",
      };
    case "footer":
      return {
        copyright: "© 2023 Your Company",
        links: [
          { text: "Privacy Policy", url: "/privacy" },
          { text: "Terms of Service", url: "/terms" },
          { text: "Contact", url: "/contact" },
        ],
        socialLinks: [
          { platform: "Twitter", url: "https://twitter.com" },
          { platform: "Facebook", url: "https://facebook.com" },
          { platform: "Instagram", url: "https://instagram.com" },
        ],
        backgroundColor: "#222222",
        textColor: "#ffffff",
        fontSize: "14px",
        height: "100px",
        width: "100%",
      };
    case "divider":
      return {
        color: "#e0e0e0",
        thickness: "1px",
        style: "solid",
        margin: "20px 0",
        height: "100px",
        width: "100%",
      };
    case "container":
      return {
        backgroundColor: "transparent",
        padding: "20px",
        borderRadius: "4px",
        borderColor: "transparent",
        borderWidth: "0px",
        borderStyle: "solid",
        canHaveChildren: true,
        height: "100px",
        width: "100%",
      };
    case "card":
      return {
        title: "Card Title",
        content: "This is a sample card content.",
        imageUrl: "https://example.com/card-image.jpg",
        buttonText: "Read More",
        buttonUrl: "",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        canHaveChildren: true,
        height: "100px",
        width: "100%",
      };
    case "list":
      return {
        items: [
          "List item 1",
          "List item 2",
          "List item 3",
        ],
        type: "unordered", // or "ordered"
        textColor: "#000000",
        fontSize: "16px",
        spacing: "8px",
        height: "100px",
        width: "100%",
      };
    case "form":
      return {
        fields: [
          { type: "text", label: "Name", placeholder: "Enter your name", required: true },
          { type: "email", label: "Email", placeholder: "Enter your email", required: true },
          { type: "textarea", label: "Message", placeholder: "Enter your message", required: false },
        ],
        submitButtonText: "Submit",
        submitButtonColor: "#007bff",
        labelColor: "#000000",
        backgroundColor: "#ffffff",
        borderColor: "#ced4da",
        height: "100px",
        width: "100%",
      };
    case "input":
      return {
        type: "text", // text, email, password, etc.
        label: "Input Label",
        placeholder: "Enter text here",
        required: false,
        labelColor: "#000000",
        borderColor: "#ced4da",
        borderRadius: "4px",
        padding: "8px 12px",
        height: "100px",
        width: "100%",
      };
    case "video":
      return {
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        autoplay: false,
        controls: true,
        width: "100%",
        height: "auto",
      };
    case "icon":
      return {
        name: "star", // icon name
        size: "24px",
        color: "#007bff",
        height: "50px",
        width: "50px",
      };
    case "div":
      return {
        backgroundColor: "transparent",
        padding: "10px",
        borderRadius: "0px",
        borderColor: "#e0e0e0",
        borderWidth: "1px",
        borderStyle: "solid",
        canHaveChildren: true,
        height: "50px",
        width: "100%",
      };
    default:
      return {
        height: "0%",
        width: "0%",
      };
  }
};
