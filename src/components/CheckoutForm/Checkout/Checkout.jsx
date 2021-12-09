import React, { useState, useEffect } from 'react';
import { Paper, Stepper, Step, StepLabel, Typography, CircularProgress, Divider, Button, CssBaseline } from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';

import { commerce } from '../../../lib/commerce';
import useStyles from './styles';
import AddressForm from '../AddressForm';
import PaymentForm from '../PaymentForm';

const Checkout = ({ cart, order, onCaptureCheckout, error, handleEmptyCart }) => {
    const classes = useStyles();
    const history = useHistory();
    const steps = ['Shipping address', 'Payment details'];
    const [activeStep, setActiveStep] = useState(0);
    const [checkoutToken, setCheckoutToken] = useState(null);
    const [shippingData, setShippingData] = useState({});
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const generateToken = async () => {
            try {
                const token = await commerce.checkout.generateToken(cart.id, { type: 'cart'});

                setCheckoutToken(token);
            } catch (error) {
                history.push('/');
            }
        };
        
        generateToken();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cart]);

    const nextStep = () => setActiveStep((previousActiveStep) => previousActiveStep + 1);
    const backStep = () => setActiveStep((previousActiveStep) => previousActiveStep - 1);

    const next = (data) => {
        setShippingData(data);

        nextStep();
    };

    const timeout = () => {
        setTimeout(() => {
            setIsFinished(true)
        }, 3000);
    };

    const handleClick = () => {
        handleEmptyCart();
    };

    let Confirmation = () => order.customer ? (
        <>
            <div>
                <Typography variant="h5">Thank you for your purchase, {order.customer.firstname} {order.customer.lastname}</Typography>
                <Divider className={classes.divider} />
                <Typography variant="subtitle2">Order ref: {order.customer.reference}</Typography>
            </div>
            <br />
            <Button component={Link} to="/" variant="outlined" type="button" onClick={handleClick}>Back to home</Button>
        </>
    ) : isFinished ? (
        <>
            <div>
                <Typography variant="h5">Thank you for your purchase.</Typography>
                <Divider className={classes.divider} />                
            </div>
            <br />
            <Button component={Link} to="/" variant="outlined" type="button" onClick={handleClick}>Back to home</Button>
        </>
    ) : (
        <div className={classes.spinner}>
            <CircularProgress />
        </div>
    );

    if(error) {
        <>
            <Typography variant="h5">Error: {error}</Typography>
            <Button component={Link} to="/" variant="outlined" type="button">Back to home</Button>
        </>
    }
    

    const Form = () => activeStep === 0
        ? <AddressForm checkoutToken={checkoutToken} next={next} />
        : <PaymentForm shippingData={shippingData} checkoutToken={checkoutToken} backStep={backStep} onCaptureCheckout={onCaptureCheckout} nextStep={nextStep} timeout={timeout} />

    return (
        <>
            <CssBaseline />
            <div className={classes.toolbar} /> 
            <main className={classes.layout}>
                <Paper className={classes.paper} elevation={6}>
                    <Typography variant="h4" align="center">Checkout</Typography>
                    <Stepper activeStep={activeStep} className={classes.stepper}>
                        {steps.map((step) => (
                            <Step key={step}>
                                <StepLabel>{step}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <div>
                        {activeStep === steps.length ? <Confirmation /> : checkoutToken && <Form />}
                    </div>
                </Paper>
            </main> 
        </>
    );
};

export default Checkout;
