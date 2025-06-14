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
    coupon_code: Schema.Attribute.Relation<
      'oneToOne',
      'api::coupon-code.coupon-code'
    >;
    HSN: Schema.Attribute.String;
    IGST: Schema.Attribute.Integer;
    price: Schema.Attribute.Decimal;
    quantity: Schema.Attribute.Integer;
    SGST: Schema.Attribute.Integer;
    sku: Schema.Attribute.String;
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

export interface DetailsGeneralDetails extends Struct.ComponentSchema {
  collectionName: 'components_details_general_details';
  info: {
    displayName: 'general_details';
  };
  attributes: {
    on_sale: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    regular_price: Schema.Attribute.Decimal;
    sale_end_date: Schema.Attribute.Date;
    sale_price: Schema.Attribute.Decimal;
    sale_start_date: Schema.Attribute.Date;
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

export interface DetailsInventoryDetails extends Struct.ComponentSchema {
  collectionName: 'components_details_inventory_details';
  info: {
    displayName: 'inventory_details';
  };
  attributes: {
    is_threshold_needed: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    low_stock_threshold: Schema.Attribute.Integer;
    slug: Schema.Attribute.String;
    stock_count: Schema.Attribute.Integer;
    stock_status: Schema.Attribute.Enumeration<
      ['In stock', 'Out of stock', 'Backorder']
    >;
    track_order: Schema.Attribute.Boolean;
  };
}

export interface DetailsItemList extends Struct.ComponentSchema {
  collectionName: 'components_details_item_lists';
  info: {
    displayName: 'item_list';
  };
  attributes: {
    billing_detail: Schema.Attribute.Component<'details.billing-detail', false>;
    products: Schema.Attribute.Relation<'oneToMany', 'api::product.product'>;
    varients: Schema.Attribute.Relation<'oneToMany', 'api::varient.varient'>;
  };
}

export interface DetailsReview extends Struct.ComponentSchema {
  collectionName: 'components_details_reviews';
  info: {
    displayName: 'review';
  };
  attributes: {
    comment: Schema.Attribute.Text;
    rating: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 1;
        },
        number
      >;
    users_permissions_user: Schema.Attribute.Relation<
      'oneToOne',
      'plugin::users-permissions.user'
    >;
  };
}

export interface DetailsShippingDetails extends Struct.ComponentSchema {
  collectionName: 'components_details_shipping_details';
  info: {
    displayName: 'shipping_details';
  };
  attributes: {
    breadth: Schema.Attribute.Decimal;
    breadth_unit: Schema.Attribute.Enumeration<['centimeters (cm)']>;
    height: Schema.Attribute.Decimal;
    height_unit: Schema.Attribute.Enumeration<
      ['centimeters (cm)', 'meters (m)']
    >;
    length: Schema.Attribute.Decimal;
    length_unit: Schema.Attribute.Enumeration<
      ['centimeters (cm)', 'millimeters (mm)', 'meters (m)']
    >;
    needed: Schema.Attribute.Boolean;
    shipping_description: Schema.Attribute.Text;
    weight: Schema.Attribute.Decimal;
    weight_unit: Schema.Attribute.Enumeration<
      ['grams (g)', 'kilograms (kg)', 'ounces (oz)']
    >;
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

export interface VarientsVarient extends Struct.ComponentSchema {
  collectionName: 'components_varients_varients';
  info: {
    displayName: 'varient';
  };
  attributes: {
    general_details: Schema.Attribute.Component<
      'details.general-details',
      false
    >;
    image_details: Schema.Attribute.Component<'details.image-details', false>;
    is_default: Schema.Attribute.Boolean;
    shipping_details: Schema.Attribute.Component<
      'details.shipping-details',
      false
    >;
    slug: Schema.Attribute.String;
    varient_description: Schema.Attribute.String;
    varient_name: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'address.delivery-address': AddressDeliveryAddress;
      'details.attribute': DetailsAttribute;
      'details.attributes-values': DetailsAttributesValues;
      'details.billing-detail': DetailsBillingDetail;
      'details.categories': DetailsCategories;
      'details.general-details': DetailsGeneralDetails;
      'details.image-details': DetailsImageDetails;
      'details.inventory-details': DetailsInventoryDetails;
      'details.item-list': DetailsItemList;
      'details.review': DetailsReview;
      'details.shipping-details': DetailsShippingDetails;
      'details.tags': DetailsTags;
      'varients.varient': VarientsVarient;
    }
  }
}
