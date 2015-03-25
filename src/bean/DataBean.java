package bean;

import java.util.ArrayList;

import javax.faces.bean.ManagedBean;
import javax.faces.bean.SessionScoped;

import com.google.gson.Gson;

import data.Contact;
import data.FileManager;

@ManagedBean
@SessionScoped
public class DataBean {
	private ArrayList<Contact> contacts = new ArrayList<Contact>();
	private FileManager fm = new FileManager();
	private Gson gson = new Gson();
	private Long pid;
	private boolean onlyStroke = false;
	private boolean diagnoseGroup = false;

	public DataBean() throws Exception {
		pid = 41199039023L;
	}

	public boolean isOnlyStroke() {
		return onlyStroke;
	}

	public void setOnlyStroke(boolean onlyStroke) {
		this.onlyStroke = onlyStroke;
	}

	public boolean isDiagnoseGroup() {
		return diagnoseGroup;
	}

	public void setDiagnoseGroup(boolean diagnoseGroup) {
		this.diagnoseGroup = diagnoseGroup;
	}

	public Long getPid() {
		return pid;
	}

	public void setPid(Long pid) {
		contacts = fm.findContacts(pid);
		for (int i=0;i<contacts.size();i++) {
			System.out.println(i + ": " + contacts.get(i));
		}
		System.out.println("Number of contacts: " + contacts.size());
		System.out.println("PID: " + pid);
		this.pid = pid;
	}

	public FileManager getFm() {
		return fm;
	}

	public void setFm(FileManager fm) {
		this.fm = fm;
	}

	public String getContacts() {
		return gson.toJson(contacts);
	}

	public void setContacts(ArrayList<Contact> contacts) {
		this.contacts = contacts;
	}

}
