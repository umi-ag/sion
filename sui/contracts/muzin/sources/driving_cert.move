module muzin::driving_cert {
    use sui::clock::{Self, Clock};
    use sui::object::{Self, UID};
    use std::string::{String, utf8};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    // The creator bundle: these two packages often go together.
    use sui::package;
    use sui::display;

    friend muzin::cert_issuer;

    struct DrivingCert has key, store {
        id: UID,
        name: String,
        description: String,
        img_url: String,
        subject: address,
        color: String,
        created_by: address,
        created_at: u64,
    }

    /// One-Time-Witness for the module.
    struct DRIVING_CERT has drop {}

    /// In the module initializer one claims the `Publisher` object
    /// to then create a `Display`. The `Display` is initialized with
    /// a set of fields (but can be modified later) and published via
    /// the `update_version` call.
    ///
    /// Keys and values are set in the initializer but could also be
    /// set after publishing if a `Publisher` object was created.
    fun init(otw: DRIVING_CERT, ctx: &mut TxContext) {
        let keys = vector[
            utf8(b"name"),
            utf8(b"link"),
            utf8(b"image_url"),
            utf8(b"description"),
            utf8(b"project_url"),
            utf8(b"creator"),
        ];

        let values = vector[
            // For `name` one can use the `DrivingCert.name` property
            utf8(b"{name}"),
            utf8(b"https://sion.umilabs.org/maybe/{id}"),
            utf8(b"{img_url}"),
            // Description is static for all `DrivingCert` objects.
            utf8(b"{description}"),
            // Project URL is usually static
            utf8(b"https://sino.umilabs.org"),
            // Creator field can be any
            utf8(b"Muzin")
        ];

        // Claim the `Publisher` for the package!
        let publisher = package::claim(otw, ctx);

        // Get a new `Display` object for the `DrivingCert` type.
        let display = display::new_with_fields<DrivingCert>(
            &publisher, keys, values, ctx
        );

        // Commit first version of `Display` to apply changes.
        display::update_version(&mut display);

        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(display, tx_context::sender(ctx));
    }

    public fun subject(self: &DrivingCert): address {
        self.subject
    }

    public fun color(self: &DrivingCert): String {
        self.color
    }

    public(friend) fun new(
        name: String,
        description: String,
        img_url: String,
        color: String,
        subject: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ): DrivingCert {
        DrivingCert {
            id: object::new(ctx),
            name,
            description,
            img_url,
            color,
            subject,
            created_by: tx_context::sender(ctx),
            created_at: clock::timestamp_ms(clock),
        }
    }

    public(friend) fun update_color(
        self: &mut DrivingCert,
        color: String,
    ) {
        self.color = color;
    }

}