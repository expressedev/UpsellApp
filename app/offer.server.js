
const OFFERS = [
    {
      id: 1,
      title: "One time offer",
      productTitle: "Mystery Coffee Bag",
      productImageURL:
        "https://cdn.shopify.com/s/files/1/0684/8990/4296/files/image.png?v=1734116135",
      productDescription: ["Surprise yourself! 😁"],
      originalPrice: "10.00",
      discountedPrice: "10.00",
      changes: [
        {
          type: "add_variant",
          variantID: 50772069974184, // Replace with the variant ID.
          quantity: 1,
          discount: {
            value: 50,
            valueType: "percentage",
            title: "(Save 50%)",
          },
        }
      ],
    },
    {
        id: 2,
        title: "One time offer",
        productTitle: "Monday Morning Brew",
        productImageURL:
          "https://cdn.shopify.com/s/files/1/0684/8990/4296/files/image_8a91bbad-e1c3-44f1-9914-e2a7c90c859d.png?v=1734116501",
        productDescription: ["Surprise yourself! 😁"],
        originalPrice: "10.00",
        discountedPrice: "10.00",
        changes: [
          {
            type: "add_variant",
            variantID: 50772069974184, // Replace with the variant ID.
            quantity: 1,
            discount: {
              value: 50,
              valueType: "percentage",
              title: "(Save 50%)",
            },
          },

        ],
      },
  ];
  
  /*
   * For testing purposes, product information is hardcoded.
   * In a production application, replace this function with logic to determine
   * what product to offer to the customer.
  */

  export function getOffers() {
    return OFFERS;
  }
  
  /*
   * Retrieve discount information for the specific order on the backend instead of relying
   * on the discount information that is sent from the frontend.
   * This is to ensure that the discount information is not tampered with.
  */
  export function getSelectedOffer(offerId) {
    return OFFERS.find((offer) => offer.id === offerId);
  }