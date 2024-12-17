/**
 * Extend Shopify Checkout with a custom Post Purchase user experience.
 * This template provides two extension points:
 *
 *  1. ShouldRender - Called first, during the checkout process, when the
 *     payment page loads.
 *  2. Render - If requested by `ShouldRender`, will be rendered after checkout
 *     completes
 */
import React from 'react';
import { useEffect, useState } from "react";
import {
  extend,
  render,
  Radio,
  useExtensionInput,
  BlockStack,
  Button,
  Banner,
  CalloutBanner,
  Heading,
  Image,
  Text,
  TextContainer,
  Separator,
  Tiles,
  TextBlock,
  Layout,
  View,
  InlineStack,
  Select
} from "@shopify/post-purchase-ui-extensions-react";


/**
 * Entry point for the `ShouldRender` Extension Point.
 *
 * Returns a value indicating whether or not to render a PostPurchase step, and
 * optionally allows data to be stored on the client for use in the `Render`
 * extension point.
 */
// For local development, replace APP_URL with your local tunnel URL.
const APP_URL = "https://bands-sick-price-bio.trycloudflare.com/";

// Preload data from your app server to ensure that the extension loads quickly.
extend(
  "Checkout::PostPurchase::ShouldRender",
  async ({ inputData, storage }) => {
    const postPurchaseOffer = await fetch(`${APP_URL}/api/offer`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${inputData.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
      }),
    }).then((response) => response.json());

    await storage.update(postPurchaseOffer);

    // For local development, always show the post-purchase page
    return { render: true };
  }
);

render("Checkout::PostPurchase::Render", () => <App />);

export function App() {
  const { storage, inputData, calculateChangeset, applyChangeset, done } =
    useExtensionInput();
  const [loading, setLoading] = useState(true);
  const [calculatedPurchase, setCalculatedPurchase] = useState();

  const { offers } = storage.initialData;

  const purchaseOption = offers[0];
  const purchaseOption2 = offers[1];

  // Define the changes that you want to make to the purchase, including the discount to the product.
  useEffect(() => {
    async function calculatePurchase() {
      // Call Shopify to calculate the new price of the purchase, if the above changes are applied.
      const result = await calculateChangeset({
        changes: purchaseOption.changes,
      });

      setCalculatedPurchase(result.calculatedPurchase);
      setLoading(false);
    }

    calculatePurchase();
  }, [calculateChangeset, purchaseOption.changes]);

  // Extract values from the calculated purchase.
  const shipping =
    calculatedPurchase?.addedShippingLines[0]?.priceSet?.presentmentMoney
      ?.amount;
  const taxes =
    calculatedPurchase?.addedTaxLines[0]?.priceSet?.presentmentMoney?.amount;
  const total = calculatedPurchase?.totalOutstandingSet.presentmentMoney.amount;
  const discountedPrice =
    calculatedPurchase?.updatedLineItems[0].totalPriceSet.presentmentMoney
      .amount;
  const originalPrice =
    calculatedPurchase?.updatedLineItems[0].priceSet.presentmentMoney.amount;

  async function acceptOffer() {
    setLoading(true);

    // Make a request to your app server to sign the changeset with your app's API secret key.
    const token = await fetch(`${APP_URL}/api/sign-changeset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${inputData.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceId: inputData.initialPurchase.referenceId,
        changes: purchaseOption.id,
      }),
    })
      .then((response) => response.json())
      .then((response) => response.token)
      .catch((e) => console.log(e));

    // Make a request to Shopify servers to apply the changeset.
    await applyChangeset(token);

    // Redirect to the thank-you page.
    done();
  }


  function declineOffer() {
    setLoading(true);
    // Redirect to the thank-you page
    done();
  }

  return (
    <BlockStack spacing="loose">
    <CalloutBanner>
      <BlockStack spacing="tight">
        <TextContainer>
          <Text size="small">
            Black Friday only!
          </Text>
        </TextContainer>
        <TextContainer>
          <Text size="medium" emphasized>
            Don't miss out! The perfect complement to the {inputData.initialPurchase.lineItems[0].product.title}
          </Text>
        </TextContainer>
      </BlockStack>
    </CalloutBanner>
    <Layout
    media={[
      { viewportSize: "small", sizes: [1, 0, 1], maxInlineSize: 0.9 },
      { viewportSize: "medium", sizes: [702, 0, 1], maxInlineSize: 420 },
      { viewportSize: "large", sizes: [810, 38, 340] },
    ]}
    >
    <Banner status='warning' iconHidden="true" >
      <TextContainer alignment="center">
              <Text size="medium">
              Don't miss out! Your special offer ends in {CountdownTimer()}
              </Text>
        </TextContainer>
    </Banner>
    </Layout>  
    <Layout
    blockAlignment='center'
      media={[
        { viewportSize: "small", sizes: [1, 0, 1], maxInlineSize: 0.9 },
        { viewportSize: "medium", sizes: [330, 0, 1], maxInlineSize: 420 },
        { viewportSize: "large", sizes: [430, 38, 340] },
      ]}
    >
      
      <Image
        description="product photo"
        source={purchaseOption.productImageURL}
      />
      <BlockStack />
      <BlockStack>
        <Heading>{purchaseOption.productTitle}</Heading>
        <InlineStack>

        <PriceHeader
          discountedPrice={discountedPrice}
          originalPrice={originalPrice}
          loading={!calculatedPurchase}    
          />
          <Text size="medium" emphasized appearance='success'>
            {purchaseOption.changes[0].discount.title}
          </Text>
          </InlineStack>
        <ProductDescription textLines={purchaseOption.productDescription} />
        <Radio>
        <Text>One Time Purchase</Text>
        </Radio>
        <Radio>
        <Text>Subscribe and Save</Text>
        </Radio>
        <Select label='Size' value='1lb' options={optionsSize}></Select>
<Select label='Quantity' value='1' options={optionsQuantity}></Select>
        <BlockStack spacing="tight">
          <Separator />
          <MoneyLine
            label="Subtotal"
            amount={discountedPrice}
            loading={!calculatedPurchase}
          />
          <MoneyLine
            label="Shipping"
            amount={shipping}
            loading={!calculatedPurchase}
          />
          <MoneyLine
            label="Taxes"
            amount={taxes}
            loading={!calculatedPurchase}
          />
          <Separator />
          <MoneySummary label="Total" amount={total} />
        </BlockStack>
        <BlockStack>
          <Button onPress={acceptOffer} submit loading={loading}>
            Pay now · {formatCurrency(total)}
          </Button>
          <Button onPress={declineOffer} subdued loading={loading}>
            Decline this offer
          </Button>
        </BlockStack>
      </BlockStack>
    </Layout>
    <Layout
    blockAlignment='center'
      media={[
        { viewportSize: "small", sizes: [1, 0, 1], maxInlineSize: 0.9 },
        { viewportSize: "medium", sizes: [330, 0, 1], maxInlineSize: 420 },
        { viewportSize: "large", sizes: [430, 38, 340] },
      ]}
    >
      
      <Image
        description="product photo"
        source={purchaseOption2.productImageURL}
      />
      <BlockStack />
      <BlockStack>
        <Heading>{purchaseOption2.productTitle}</Heading>
        <InlineStack>

        <PriceHeader
          discountedPrice={discountedPrice}
          originalPrice={originalPrice}
          loading={!calculatedPurchase}    
          />
          <Text size="medium" emphasized appearance='success'>
            {purchaseOption2.changes[0].discount.title}
          </Text>
          </InlineStack>
        <ProductDescription textLines={purchaseOption2.productDescription} />
        <Radio>
        <Text>One Time Purchase</Text>
        </Radio>
        <Radio >
        <Text>Subscribe and Save</Text>
        </Radio>
        <Select label='Size' value='1lb' options={optionsSize}></Select>
        <Select label='Quantity' value='1' options={optionsQuantity}></Select>

        <BlockStack spacing="tight">
          <Separator />
          <MoneyLine
            label="Subtotal"
            amount={discountedPrice}
            loading={!calculatedPurchase}
          />
          <MoneyLine
            label="Shipping"
            amount={shipping}
            loading={!calculatedPurchase}
          />
          <MoneyLine
            label="Taxes"
            amount={taxes}
            loading={!calculatedPurchase}
          />
          <Separator />
          <MoneySummary label="Total" amount={total} />
        </BlockStack>
        <BlockStack>
          <Button onPress={acceptOffer} submit loading={loading}>
            Pay now · {formatCurrency(total)}
          </Button>
          <Button onPress={declineOffer} subdued loading={loading}>
            Decline this offer
          </Button>
        </BlockStack>
      </BlockStack>
    </Layout>
  </BlockStack>
  );
}

function PriceHeader({ discountedPrice, originalPrice, loading }) {
  return (
    <TextContainer alignment="leading" spacing="loose">
      <Text emphasized="true" size="large">
        {!loading && formatCurrency(discountedPrice)}
        {" "}
      </Text>
      <Text subdued="true" role="deletion" size="medium">
        {!loading && formatCurrency(originalPrice)}
      </Text>
    </TextContainer>
  );
}

function ProductDescription({ textLines }) {
  return (
    <BlockStack spacing="xtight">
      {textLines.map((text, index) => (
        <TextBlock key={index} subdued>
          {text}
        </TextBlock>
      ))}
    </BlockStack>
  );
}

function MoneyLine({ label, amount, loading = false }) {
  return (
    <Tiles>
      <TextBlock size="small">{label}</TextBlock>
      <TextContainer alignment="trailing">
        <TextBlock emphasized size="small">
          {loading ? "-" : formatCurrency(amount)}
        </TextBlock>
      </TextContainer>
    </Tiles>
  );
}

function MoneySummary({ label, amount }) {
  return (
    <Tiles>
      <TextBlock size="medium" emphasized>
        {label}
      </TextBlock>
      <TextContainer alignment="trailing">
        <TextBlock emphasized size="medium">
          {formatCurrency(amount)}
        </TextBlock>
      </TextContainer>
    </Tiles>
  );
}

const optionsSize = [
  { value: '1lb', label: '1lb' },
  { value: '2lb', label: '2lb' }
]
const optionsQuantity = [
  { value: '1', label: '1' },
  { value: '2', label: '2' }, 
  { value: '3', label: '3' },
  { value: '4', label: '4' }
]

function formatCurrency(amount) {
  if (!amount || parseInt(amount, 10) === 0) {
    return "Free";
  }
  return `$${amount}`;
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(300); // 300 seconds (5 minutes)

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on unmount
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`; // MM:SS format
  };

  return formatTime(timeLeft);
}

