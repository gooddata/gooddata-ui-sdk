// PackSafe integration
// Minified PactSafe Snippet
(function(w,d,s,c,f,n,t,g,a,b,l){w['PactSafeObject']=n;w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},w[n].on=function(){(w[n].e=w[n].e||[]).push(arguments)},w[n].once=function(){(w[n].eo=w[n].eo||[]).push(arguments)},w[n].off=function(){(w[n].o=w[n].o||[]).push(arguments)},w[n].t=1*new Date(),w[n].l=0;a=d.createElement(s);b=d.getElementsByTagName(s)[0];a.async=1;a.src=c;a.onload=a.onreadystatechange=function(){w[n].l=1};a.onerror=a.onabort=function(){w[n].l=0};b.parentNode.insertBefore(a,b);setTimeout(function(){if(!w[n].l&&!w[n].loaded){w[n].error=1;a=d.createElement(s);a.async=1;a.src=f;a.onload=a.onreadystatechange=function(){w[n].l=1};a.onerror=a.onabort=function(){w[n].l=0};b.parentNode.insertBefore(a,b);l=function(u,e){try{e=d.createElement('img');e.src='https://d3r8bdci515tjv.cloudfront.net/error.gif?t='+w[n].t+'&u='+encodeURIComponent(u);d.getElementsByTagName('body')[0].appendChild(e)}catch(x){}};l(c);setTimeout(function(){if(!w[n].l&&!w[n].loaded){w[n].error=1;if(g&&'function'==typeof g){g.call(this);}l(f)}},t)}},t)})(window,document,'script','https://vault.pactsafe.io/ps.min.js','https://d3l1mqnl5xpsuc.cloudfront.net/ps.min.js','_ps',4000);

// We'll need a couple of things to get started from PactSafe.
let siteAccessId = '4e035f09-34a3-488b-9059-738222437555'; // A PactSafe Site Access ID
let groupKey = "group-sk0pg09zu"; // A PactSafe Group Key.

// Creates a Site object with the a PactSafe Site Access ID.
_ps('create', siteAccessId);

// Since we're testing, we can enable debugging
// which will log events to console. You'll want to
// set this to false in a production environment.
//_ps.debug = true;

// Options set on the PactSafe Group.
let groupOptions = {
    container_selector: 'pactsafe-container', // ID of where we want the clickwrap to load in the page.
    display_all: true, // Always display the contracts, even if previously signed by the Signer.
    signer_id_selector: 'fake-uid', // Uses the email input field value as the Signer ID and listen to the field.
    test_mode: true, // Allows you to clear test data from the PactSafe web app.
}

// Load a Clickwrap group into the page.
_ps('load', groupKey, groupOptions);

// If there's an error from the PactSafe snippet,
// you may want to prevent submission if needed.
_ps.on('error', function(message, event_type, context) {
    // Handle any errors.
    //console.log(arguments);
});

// Return whether to block the submission or not.
function blockSubmission() {
    // Check to ensure we're able to get the Group successfully.
    if (_ps.getByKey(groupKey)) {

        // Return if we should block the submission using the .block() method
        // provided by the Group object.
        return _ps.getByKey(groupKey).block();
    } else {
        // We weren't able to get the group,
        // so blocking form submission may be needed.
        return true;
    }
}

// We want to prevent the form submission
// unless acceptance has gone through.
function addFormAcceptanceValidation() {
    // Get the form element.
    let btn = document.getElementById("cta-tiger-join-us-on-slack-bumper");

    // Return if no btn is found in the page.
    if (!btn) return;

    let btnObj = $("#"+btn.id);

    // Add listener for form submissions.
    btn.addEventListener('click', function(event) {
        // Prevent the form from automatically submitting without
        // checking PactSafe acceptance first.
        event.preventDefault();

        if (!blockSubmission()) {
            btnObj.tooltip('hide');
            btnObj.tooltip('disable');
            // We don't need to block so proceed.
            dataLayer.push({
                'event': 'trackEvent',
                'eventCategory': 'cta',
                'eventAction': 'join us on slack',
                'eventLabel': 'tiger'
            });
            window.open("https://join.slack.com/t/gooddataconnect/shared_invite/zt-mkqhg6bm-omgjndejTlTyB3wgaVkkGQ", "_blank");

        } else {
            btnObj.tooltip('enable');
            btnObj.tooltip('show');
        }
    });
}

// Set up validation of Terms before allowing form submission.
if (document.readyState === 'loading') {  // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', addFormAcceptanceValidation);
} else {  // `DOMContentLoaded` has already fired
    addFormAcceptanceValidation();
}