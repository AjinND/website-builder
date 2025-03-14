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
      };
    case "text":
      return {
        content: "Sample Text",
        textColor: "#000000",
        fontSize: "16px",
        fontWeight: "normal",
      };
    case "button":
      return {
        text: "Click Me",
        linkTo: "", // Page to link to
        backgroundColor: "#007bff",
        textColor: "#ffffff",
        fontSize: "16px",
        fontWeight: "bold",
      };
    case "image":
      return {
        imageUrl: "https://example.com/image.jpg",
        linkTo: "", // Page to link to
      };
    default:
      return {};
  }
};
