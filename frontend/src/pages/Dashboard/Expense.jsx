import React, { useEffect, useState } from 'react'
import { useUserAuth } from '../../hooks/UseUserAuth'
import DashboardLayout from '../../components/layouts/DashboardLayout';
import toast from 'react-hot-toast';
import axiosInstance from '../../Utils/axiosInstance';
import { API_PATHS } from '../../Utils/apiPaths';
import ExpenseOverview from '../../components/Expense/ExpenseOverview';
import AddExpenseForm from '../../components/Expense/AddExpenseForm';
import Modal from '../../components/Modal';
import ExpenseList from '../../components/Expense/ExpenseList';
import DeleteAlert from '../../components/DeleteAlert';

const Expense = () => {
  useUserAuth();

  const [expenseData, setExpenseData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
      show: false,
      data: null,
    })
    const [ openAddExpenseModal, setOpenAddExpenseModal ] = useState(false)

    // Get All Income Details
  const fetchExpenseDetails = async () => {
    if(loading) return ;

    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`
      );

      if(response.data){
        setExpenseData(response.data)
      }
    } catch (error) {
      console.log("Something went wrong. Please try again", error)
    } finally{
      setLoading(false);
    }
  };

  // Handle Add Expense
  const handleAddExpense = async (expense) => {
    const { category, amount, date, icon} = expense;

    // Validation checks
    if(!category.trim()){
      toast.error("Category is required.");
      return;
    }

    if(!amount || isNaN(amount) || Number(amount) <= 0){
      toast.error("Amount should be valid number greater than 0.");
      return;
    }

    if(!date) {
      toast.error("Date is required")
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
        category,
        amount,
        date,
        icon,
      });

      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully.")
      fetchExpenseDetails()
    } catch (error) {
      console.error(
        "Error adding expense:",
        error.response?.data?.message || error.message
      )
    }
  };

  // Delete Expense
  const deleteExpense = async (id) => {
    try{
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id))

      setOpenDeleteAlert({ show: false, data: null});
      toast.success("Expense details deleted successfully")
      fetchExpenseDetails()
    } catch (error) {
      console.error(
        "Error deleting expense:",
        error.response?.data?.message || error.message
      );
    }
  };

  // Handle download expense details
  const handleDownloadExpense = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,
        {
          responseType: "blob"
        }
      );

      // Create URL for blob
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a");
      link.href = url
      link.setAttribute("download", "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error downloading expense details.:", error);
        toast.error("Failed to download expense details. Please try again..")
    }
  };

  useEffect(() => {
    fetchExpenseDetails()

    return () => {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className='my-5 mx-auto'>
        <div className='grid grid-cols-1 gap-6'>
          <div className=''>
            <ExpenseOverview
              transactions={expenseData}
              onExpenseIncome={() => setOpenAddExpenseModal(true)}
            />  
          </div>

          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => {
              setOpenDeleteAlert({show: true, data: id})
            }}
            onDownload={handleDownloadExpense}
          />  
        </div>

        <Modal
          isOpen={openAddExpenseModal}
          onClose={() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />
          </Modal>  

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense detail?"
            onDelete={() => deleteExpense(openDeleteAlert.data)}
          />  
        </Modal>  
      </div>
      </DashboardLayout>
  )
}

export default Expense