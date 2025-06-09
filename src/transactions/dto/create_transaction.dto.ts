type CreateTransactionDto = {
    title: string;
    description?: string;
    amount: number;
    type: string;
};

export default CreateTransactionDto;