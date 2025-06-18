import type { Schema, Struct } from '@strapi/strapi';

export interface AddressDeliveryAddress extends Struct.ComponentSchema {
  collectionName: 'components_address_delivery_addresses';
  info: {
    displayName: 'delivery_address';
  };
  attributes: {
    address_name: Schema.Attribute.String;
    area_street: Schema.Attribute.Text;
    city: Schema.Attribute.String;
    country: Schema.Attribute.String;
    default_address: Schema.Attribute.Boolean;
    flat_address: Schema.Attribute.Text;
    full_name: Schema.Attribute.String;
    landmark: Schema.Attribute.Text;
    mobile_number: Schema.Attribute.Integer;
    pincode: Schema.Attribute.Integer;
    state: Schema.Attribute.String;
  };
}

export interface CartOrderCartOrder extends Struct.ComponentSchema {
  collectionName: 'components_cart_order_cart_orders';
  info: {
    displayName: 'cart_order';
  };
  attributes: {
    cart: Schema.Attribute.Relation<'oneToOne', 'api::cart.cart'>;
  };
}

export interface DetailsAttribute extends Struct.ComponentSchema {
  collectionName: 'components_details_attributes';
  info: {
    displayName: 'attribute';
  };
  attributes: {
    attribute_name: Schema.Attribute.String;
    values: Schema.Attribute.Component<'details.attributes-values', true>;
  };
}

export interface DetailsAttributesValues extends Struct.ComponentSchema {
  collectionName: 'components_details_attributes_values';
  info: {
    displayName: 'attributes_values';
  };
  attributes: {
    is_visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    value: Schema.Attribute.String;
  };
}

export interface DetailsBillingDetail extends Struct.ComponentSchema {
  collectionName: 'components_details_billing_details';
  info: {
    displayName: 'billing_detail';
  };
  attributes: {
    CGST: Schema.Attribute.Integer;
    HSN: Schema.Attribute.String;
    IGST: Schema.Attribute.Integer;
    SGST: Schema.Attribute.Integer;
  };
}

export interface DetailsCategories extends Struct.ComponentSchema {
  collectionName: 'components_details_categories';
  info: {
    displayName: 'categories';
  };
  attributes: {
    category_name: Schema.Attribute.String;
  };
}

export interface DetailsGiftCardDetails extends Struct.ComponentSchema {
  collectionName: 'components_details_gift_card_details';
  info: {
    displayName: 'gift_card_details';
  };
  attributes: {
    code: Schema.Attribute.String;
    current_balance: Schema.Attribute.String;
    gift_card_name: Schema.Attribute.String;
    initial_balance: Schema.Attribute.Decimal;
    is_valid: Schema.Attribute.Boolean;
  };
}

export interface DetailsImageDetails extends Struct.ComponentSchema {
  collectionName: 'components_details_image_details';
  info: {
    displayName: 'image_details';
  };
  attributes: {
    gallery_image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios',
      true
    >;
    main_image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
  };
}

export interface DetailsItemList extends Struct.ComponentSchema {
  collectionName: 'components_details_item_lists';
  info: {
    displayName: 'item_list';
  };
  attributes: {
    product: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    quantity: Schema.Attribute.Integer;
    varient: Schema.Attribute.Relation<'oneToOne', 'api::varient.varient'>;
  };
}

export interface DetailsShippingDetails extends Struct.ComponentSchema {
  collectionName: 'components_details_shipping_details';
  info: {
    displayName: 'shipping_details';
  };
  attributes: {
    depth: Schema.Attribute.Decimal;
    height: Schema.Attribute.Decimal;
    needed: Schema.Attribute.Boolean;
    shipping_description: Schema.Attribute.Text;
    weight: Schema.Attribute.Decimal;
    width: Schema.Attribute.Decimal;
  };
}

export interface DetailsTags extends Struct.ComponentSchema {
  collectionName: 'components_details_tags';
  info: {
    displayName: 'tags';
    icon: 'book';
  };
  attributes: {
    tag_name: Schema.Attribute.String;
  };
}

export interface OffersCouponOffer extends Struct.ComponentSchema {
  collectionName: 'components_offers_coupon_offers';
  info: {
    displayName: 'coupon_offer';
  };
  attributes: {
    coupon_name: Schema.Attribute.String;
    offer_type: Schema.Attribute.Enumeration<
      ['special_offer', 'partner_offer']
    >;
    partner_offer: Schema.Attribute.Component<'offers.partner-offer', true>;
    price_type: Schema.Attribute.Enumeration<
      ['fixed_discount', 'percentage_discount']
    >;
    special_offer: Schema.Attribute.Component<'offers.special-offer', false>;
  };
}

export interface OffersPartnerOffer extends Struct.ComponentSchema {
  collectionName: 'components_offers_partner_offers';
  info: {
    displayName: 'partner_offer';
  };
  attributes: {
    amount: Schema.Attribute.Decimal;
    expired_date: Schema.Attribute.Date;
    maximum_off: Schema.Attribute.Decimal;
    offer_description: Schema.Attribute.Text;
    products: Schema.Attribute.Relation<'oneToOne', 'api::product.product'>;
    start_date: Schema.Attribute.Date;
  };
}

export interface OffersProductBankOffer extends Struct.ComponentSchema {
  collectionName: 'components_offers_product_bank_offers';
  info: {
    displayName: 'product_bank_offer';
  };
  attributes: {
    amount: Schema.Attribute.Decimal;
    bank: Schema.Attribute.String;
    expired_date: Schema.Attribute.Date;
    maximum_off: Schema.Attribute.Decimal;
    offer_description: Schema.Attribute.Text;
    price_type: Schema.Attribute.Enumeration<
      ['fixed_discount', 'percentage_discount']
    >;
    scope: Schema.Attribute.Enumeration<['product specific', 'cart level']>;
    start_date: Schema.Attribute.Date;
  };
}

export interface OffersSpecialOffer extends Struct.ComponentSchema {
  collectionName: 'components_offers_special_offers';
  info: {
    displayName: 'coupon_special_price';
  };
  attributes: {
    amount: Schema.Attribute.Decimal;
    expired_date: Schema.Attribute.Date;
    maximum_off: Schema.Attribute.Decimal;
    offer_description: Schema.Attribute.Text;
    start_date: Schema.Attribute.Date;
  };
}

export interface OffersSpecialPrice extends Struct.ComponentSchema {
  collectionName: 'components_offers_special_prices';
  info: {
    displayName: 'special_price';
  };
  attributes: {
    amount: Schema.Attribute.Decimal;
    description: Schema.Attribute.Text;
    expired_date: Schema.Attribute.Date;
    price_type: Schema.Attribute.Enumeration<
      ['fixed_discount', 'percentage_discount']
    >;
    start_date: Schema.Attribute.Date;
  };
}

export interface ProductTypesAffiliateProduct extends Struct.ComponentSchema {
  collectionName: 'components_product_types_affiliate_products';
  info: {
    displayName: 'affiliate_product';
  };
  attributes: {
    affiliate_tracking_code: Schema.Attribute.String;
    external_url: Schema.Attribute.String;
    product_price: Schema.Attribute.Decimal;
  };
}

export interface ProductTypesGroupedProduct extends Struct.ComponentSchema {
  collectionName: 'components_product_types_grouped_products';
  info: {
    displayName: 'grouped_product';
  };
  attributes: {
    image_details: Schema.Attribute.Component<'details.image-details', false>;
    product_price: Schema.Attribute.Decimal;
    quantity: Schema.Attribute.Integer;
    shipping_details: Schema.Attribute.Component<
      'details.shipping-details',
      false
    >;
    tax_details: Schema.Attribute.Component<'details.billing-detail', false>;
    total_tax: Schema.Attribute.Decimal;
  };
}

export interface ProductTypesSimpleProduct extends Struct.ComponentSchema {
  collectionName: 'components_product_types_simple_products';
  info: {
    displayName: 'simple_product';
  };
  attributes: {
    image_details: Schema.Attribute.Component<'details.image-details', false>;
    product_price: Schema.Attribute.Decimal;
    shipping_details: Schema.Attribute.Component<
      'details.shipping-details',
      false
    >;
    tax_details: Schema.Attribute.Component<'details.billing-detail', false>;
    total_tax: Schema.Attribute.Decimal;
  };
}

export interface ProductTypesVarientProduct extends Struct.ComponentSchema {
  collectionName: 'components_product_types_varient_products';
  info: {
    displayName: 'varient_product';
  };
  attributes: {
    attributes: Schema.Attribute.Component<'details.attribute', true>;
    varients: Schema.Attribute.Relation<'oneToMany', 'api::varient.varient'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'address.delivery-address': AddressDeliveryAddress;
      'cart-order.cart-order': CartOrderCartOrder;
      'details.attribute': DetailsAttribute;
      'details.attributes-values': DetailsAttributesValues;
      'details.billing-detail': DetailsBillingDetail;
      'details.categories': DetailsCategories;
      'details.gift-card-details': DetailsGiftCardDetails;
      'details.image-details': DetailsImageDetails;
      'details.item-list': DetailsItemList;
      'details.shipping-details': DetailsShippingDetails;
      'details.tags': DetailsTags;
      'offers.coupon-offer': OffersCouponOffer;
      'offers.partner-offer': OffersPartnerOffer;
      'offers.product-bank-offer': OffersProductBankOffer;
      'offers.special-offer': OffersSpecialOffer;
      'offers.special-price': OffersSpecialPrice;
      'product-types.affiliate-product': ProductTypesAffiliateProduct;
      'product-types.grouped-product': ProductTypesGroupedProduct;
      'product-types.simple-product': ProductTypesSimpleProduct;
      'product-types.varient-product': ProductTypesVarientProduct;
    }
  }
}
